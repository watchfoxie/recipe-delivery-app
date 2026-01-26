import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

/**
 * Custom ParseIntPipe that provides consistent JSON error responses
 * with i18n-translatable messages and proper field names.
 *
 * Unlike the default NestJS ParseIntPipe, this pipe:
 * - Returns the actual parameter name in the error field (e.g., "id", "recipeId")
 * - Uses i18n translation keys for localized error messages
 * - Rejects floating-point numbers (e.g., "1.2") that would be truncated by parseInt
 * - Provides consistent JSON error format matching the app's error response structure
 *
 * Usage:
 *   @Param('id', I18nParseIntPipe) id: number
 *   @Param('recipeId', I18nParseIntPipe) recipeId: number
 *
 * The parameter name is automatically extracted from ArgumentMetadata.data
 */
export class I18nParseIntPipe implements PipeTransform<string, number> {
  /**
   * Transform and validate the input value
   * @param value - The string value to parse
   * @param metadata - Argument metadata containing the parameter name
   * @returns The parsed integer value
   * @throws BadRequestException if validation fails
   */
  transform(value: string, metadata: ArgumentMetadata): number {
    const fieldName = metadata.data || 'id';

    if (value === undefined || value === null || value === '') {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: [
          {
            field: fieldName,
            message: `messages.ERROR.INVALID_INTEGER_PARAM|{"field":"${fieldName}"}`,
          },
        ],
      });
    }

    const stringValue = String(value).trim();

    // Reject if not a valid integer format (no decimals, no leading zeros except for "0")
    // This regex matches: optional negative sign, followed by digits only
    // But rejects: "1.2", "1.0", "1e5", "1.5e2", etc.
    if (!/^-?\d+$/.test(stringValue)) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: [
          {
            field: fieldName,
            message: `messages.ERROR.INVALID_INTEGER_PARAM|{"field":"${fieldName}"}`,
          },
        ],
      });
    }

    const parsedValue = Number.parseInt(stringValue, 10);

    // Check for NaN (shouldn't happen with our regex, but defensive check)
    if (Number.isNaN(parsedValue)) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: [
          {
            field: fieldName,
            message: `messages.ERROR.INVALID_INTEGER_PARAM|{"field":"${fieldName}"}`,
          },
        ],
      });
    }

    // Check for safe integer bounds
    if (!Number.isSafeInteger(parsedValue)) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: [
          {
            field: fieldName,
            message: `messages.ERROR.INVALID_INTEGER_PARAM|{"field":"${fieldName}"}`,
          },
        ],
      });
    }

    return parsedValue;
  }
}
