import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HTTP_STATUS_CODES } from '../status-codes/http-status-codes';

const SUCCESS_STATUSES = [200, 201] as const;
const ERROR_STATUSES = [400, 401, 403, 404, 409, 422, 500] as const;

type SuccessStatus = (typeof SUCCESS_STATUSES)[number];

type DecoratorType = Type<unknown> | [Type<unknown>];

export function ApiStandardResponses(type?: DecoratorType) {
  const decorators = [...SUCCESS_STATUSES, ...ERROR_STATUSES].map((status) =>
    ApiResponse({
      status,
      description: HTTP_STATUS_CODES[status],
      ...(type && SUCCESS_STATUSES.includes(status as SuccessStatus)
        ? { type }
        : {}),
    }),
  );

  return applyDecorators(...decorators);
}

export function ApiSuccessResponse(type: DecoratorType, status: SuccessStatus = 200) {
  return ApiResponse({
    status,
    description: HTTP_STATUS_CODES[status],
    type,
  });
}

export function ApiErrorResponses() {
  const decorators = ERROR_STATUSES.map((status) =>
    ApiResponse({
      status,
      description: HTTP_STATUS_CODES[status],
    }),
  );

  return applyDecorators(...decorators);
}
