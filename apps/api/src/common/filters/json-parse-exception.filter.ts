/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { ERROR_MESSAGES } from '../constants/messages.constants';

@Catch(SyntaxError, BadRequestException)
export class JsonParseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { cookies?: Record<string, string> }>();

    const { isJsonError } = this.extractJsonErrorDetails(exception);

    if (!isJsonError) {
      throw exception;
    }

    const i18n = I18nContext.current(host);
    const lang = this.resolveLanguage(req);

    const payload = {
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message: [
        {
          field: 'json_body',
          message: `${
            i18n?.t('messages.ERROR.VALIDATION_FAILED', { lang }) ??
            ERROR_MESSAGES.VALIDATION_FAILED
          }: ${
              i18n?.t('messages.ERROR.JSON_PARSE_ERROR', { lang }) ??
              ERROR_MESSAGES.JSON_PARSE_ERROR
          }`,
        },
      ],
    } as const;

    return res.status(HttpStatus.BAD_REQUEST).json(payload);
  }

  private resolveLanguage(req: Request & { cookies?: Record<string, string> }): string {
    const queryLang = (req.query?.lang as string | undefined)?.toLowerCase();
    const headerLang = this.pickHeaderValue(req.headers?.['x-lang'])?.toLowerCase();
    const cookieLang = req.cookies?.lang?.toLowerCase();
    const acceptLanguage = req.headers?.['accept-language'];
    const acceptPrimary = acceptLanguage?.split(',')[0]?.split('-')[0]?.toLowerCase();

    return queryLang || headerLang || cookieLang || acceptPrimary || 'ro';
  }

  private extractJsonErrorDetails(exception: unknown): {
    isJsonError: boolean;
  } {
    let message: string | null = null;

    if (exception instanceof BadRequestException) {
      const resp = exception.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (
        typeof resp === 'object' &&
        resp !== null &&
        'message' in resp
      ) {
        const value = (resp as { message?: unknown }).message;
        if (typeof value === 'string') {
          message = value;
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
          message = value[0];
        }
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception &&
      typeof (exception as { message: unknown }).message === 'string'
    ) {
      message = (exception as { message: string }).message;
    }

    const mentionsJson =
      typeof message === 'string' &&
      /JSON|Unexpected|position|column|line|Unterminated/i.test(message);

    return { isJsonError: Boolean(mentionsJson) };
  }

  private pickHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }
}
