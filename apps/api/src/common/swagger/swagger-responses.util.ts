import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { HTTP_STATUS_CODES } from '../status-codes/http-status-codes';
import { createPaginatedResponseDto } from '../dto/paginated-response.dto';

const SUCCESS_STATUSES = [200, 201] as const;
const ERROR_STATUSES = [400, 401, 403, 404, 409, 422, 500] as const;

type SuccessStatus = (typeof SUCCESS_STATUSES)[number];

type DecoratorType = Type<unknown> | [Type<unknown>];

interface StandardResponseOptions {
  isArray?: boolean;
  isPaginated?: boolean;
}

export function ApiStandardResponses(type?: DecoratorType, options: StandardResponseOptions = {}) {
  const resolvedType = Array.isArray(type) ? type[0] : type;
  const extraModels: Type<unknown>[] = [];
  let paginatedModel: Type<unknown> | undefined;

  if (resolvedType) {
    extraModels.push(resolvedType);
  }

  if (resolvedType && options.isPaginated) {
    paginatedModel = createPaginatedResponseDto(resolvedType);
    extraModels.push(paginatedModel);
  }

  const decorators: MethodDecorator[] = [];

  if (extraModels.length) {
    decorators.push(ApiExtraModels(...extraModels));
  }

  [...SUCCESS_STATUSES, ...ERROR_STATUSES].forEach((status) => {
    if (SUCCESS_STATUSES.includes(status as SuccessStatus)) {
      decorators.push(
        ApiResponse({
          status,
          description: HTTP_STATUS_CODES[status],
          schema: buildSuccessSchema(resolvedType, options, paginatedModel),
        }),
      );
    } else {
      decorators.push(
        ApiResponse({
          status,
          description: HTTP_STATUS_CODES[status],
          schema: buildErrorSchema(),
        }),
      );
    }
  });

  return applyDecorators(...decorators);
}

export function ApiSuccessResponse(type: DecoratorType, status: SuccessStatus = 200) {
  return ApiResponse({
    status,
    description: HTTP_STATUS_CODES[status],
    schema: buildSuccessSchema(Array.isArray(type) ? type[0] : type),
  });
}

export function ApiErrorResponses() {
  const decorators = ERROR_STATUSES.map((status) =>
    ApiResponse({
      status,
      description: HTTP_STATUS_CODES[status],
      schema: buildErrorSchema(),
    }),
  );

  return applyDecorators(...decorators);
}

function buildSuccessSchema(
  type?: Type<unknown>,
  options: StandardResponseOptions = {},
  paginatedModel?: Type<unknown>,
) {
  const dataSchema = resolveDataSchema(type, options, paginatedModel);
  return {
    type: 'object',
    properties: {
      message: { type: 'string' },
      data: dataSchema,
    },
    required: ['message', 'data'],
  };
}

function resolveDataSchema(
  type?: Type<unknown>,
  options: StandardResponseOptions = {},
  paginatedModel?: Type<unknown>,
) {
  if (!type) {
    return { type: 'object', nullable: true };
  }

  if (options.isPaginated && paginatedModel) {
    return { $ref: getSchemaPath(paginatedModel) };
  }

  if (options.isArray) {
    return {
      type: 'array',
      items: { $ref: getSchemaPath(type) },
    };
  }

  return { $ref: getSchemaPath(type) };
}

function buildErrorSchema() {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number' },
      error: { type: 'string' },
      message: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['field', 'message'],
        },
      },
    },
    required: ['statusCode', 'error', 'message'],
  };
}
