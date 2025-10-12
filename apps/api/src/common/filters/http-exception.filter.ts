import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { I18nValidationException } from 'nestjs-i18n';
import { HTTP_STATUS_CODES } from '../status-codes/http-status-codes';

interface ErrorMessagePayload {
  field: string;
  message: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof I18nValidationException) {
      throw exception;
    }

    if (exception instanceof BadRequestException && this.looksLikeJsonParse(exception)) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    const errorLabel = this.extractErrorLabel(payload, status);
    const messages = this.normalizeMessages(payload, status);

    response.status(status).json({
      statusCode: status,
      error: errorLabel,
      message: messages,
    });
  }

  private extractErrorLabel(payload: unknown, status: number): string {
    if (payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error: unknown }).error === 'string') {
      return (payload as { error: string }).error;
    }
    return HTTP_STATUS_CODES[status] ?? 'Error';
  }

  private normalizeMessages(payload: unknown, status: number): ErrorMessagePayload[] {
    if (!payload) {
      return [
        {
          field: 'general',
          message: HTTP_STATUS_CODES[status] ?? 'Error',
        },
      ];
    }

    if (typeof payload === 'string') {
      return [
        {
          field: 'general',
          message: payload,
        },
      ];
    }

    if (Array.isArray((payload as { message?: unknown }).message)) {
      return ((payload as { message: unknown[] }).message ?? []).map((value) =>
        typeof value === 'object' && value !== null && 'field' in value && 'message' in value
          ? {
              field: String((value as { field: unknown }).field),
              message: String((value as { message: unknown }).message),
            }
          : {
              field: 'general',
              message: String(value),
            },
      );
    }

    if (typeof (payload as { message?: unknown }).message === 'string') {
      return [
        {
          field: 'general',
          message: String((payload as { message: string }).message),
        },
      ];
    }

    return [
      {
        field: 'general',
        message: HTTP_STATUS_CODES[status] ?? 'Error',
      },
    ];
  }

  private looksLikeJsonParse(exception: BadRequestException): boolean {
    const payload = exception.getResponse();
    if (typeof payload === 'string') {
      return /JSON|Unexpected|position|column|line|Unterminated/i.test(payload);
    }
    if (payload && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string') {
      return /JSON|Unexpected|position|column|line|Unterminated/i.test(
        String((payload as { message: string }).message),
      );
    }
    return false;
  }
}