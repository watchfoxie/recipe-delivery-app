import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ValidationError } from 'class-validator';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';
import { ERROR_MESSAGES } from '../constants/messages.constants';

interface ValidationMessage {
  field: string;
  message: string;
}

@Catch(I18nValidationException, BadRequestException)
export class I18nValidationExceptionFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    if (!this.isHandledException(exception)) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.extractStatus(exception);
    const lang = this.resolveLanguage(host);
    const errorLabel = this.extractErrorLabel(exception);
    const i18n = I18nContext.current(host);
    const messages = await this.extractMessages(exception, lang, i18n);

    return response.status(status).json({
      statusCode: status,
      error: errorLabel,
      message: messages,
    });
  }

  private isHandledException(exception: unknown): exception is HttpException {
    if (!(exception instanceof HttpException)) {
      return false;
    }

    if (exception instanceof BadRequestException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return true;
      }
      if (payload && typeof payload === 'object') {
        if (Array.isArray((payload as { message?: unknown }).message)) {
          return true;
        }
        if (typeof (payload as { message?: unknown }).message === 'string') {
          return true;
        }
      }
    }

    return exception instanceof I18nValidationException;
  }

  private extractStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.BAD_REQUEST;
  }

  private extractErrorLabel(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as { error?: string } | string;
      if (typeof response === 'string') {
        return response || 'Bad Request';
      }
      if (response?.error) {
        return response.error;
      }
    }
    return 'Bad Request';
  }

  private async extractMessages(
    exception: unknown,
    lang: string,
    i18n?: I18nContext,
  ): Promise<ValidationMessage[]> {
    if (exception instanceof I18nValidationException) {
      return this.flattenErrors(exception.errors, lang, i18n);
    }

    if (exception instanceof BadRequestException) {
      const payload = exception.getResponse();
      if (Array.isArray((payload as { message?: unknown }).message)) {
        const mapped = await Promise.all(
          ((payload as { message: unknown[] }).message ?? []).map((value) =>
            this.resolveConstraint(value, lang, i18n),
          ),
        );

        return mapped.map((message) => ({
          field: 'general',
          message,
        }));
      }
      if (typeof (payload as { message?: unknown }).message === 'string') {
        return [
          {
            field: 'general',
            message: await this.resolveConstraint(
              (payload as { message: string }).message,
              lang,
              i18n,
            ),
          },
        ];
      }
      if (typeof payload === 'string') {
        return [
          {
            field: 'general',
            message: await this.resolveConstraint(payload, lang, i18n),
          },
        ];
      }
    }

    const fallback = await this.resolveConstraint(
      'messages.ERROR.VALIDATION_FAILED',
      lang,
      i18n,
    );

    return [
      {
        field: 'general',
        message: fallback,
      },
    ];
  }

  private async flattenErrors(
    errors: ValidationError[],
    lang: string,
    i18n?: I18nContext,
    parentPath = '',
  ): Promise<ValidationMessage[]> {
    const messages: ValidationMessage[] = [];

    for (const error of errors) {
      const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property;
      const constraints = error.constraints ?? {};
      const children = error.children ?? [];

      for (const text of Object.values(constraints)) {
        const message = await this.resolveConstraint(text, lang, i18n);
        messages.push({ field: fieldPath, message });
      }

      if (!Object.keys(constraints).length && !children.length) {
        const fallback = await this.resolveConstraint(
          'messages.ERROR.VALIDATION_FAILED',
          lang,
          i18n,
        );
        messages.push({ field: fieldPath, message: fallback });
      }

      if (children.length) {
        const childMessages = await this.flattenErrors(children, lang, i18n, fieldPath);
        messages.push(...childMessages);
      }
    }

    return messages;
  }

  private async resolveConstraint(
    value: unknown,
    lang: string,
    i18n?: I18nContext,
  ): Promise<string> {
    if (typeof value !== 'string') {
      return String(value);
    }

    const [rawKey, rawArgs] = value.split('|', 2);
    const key = rawKey || 'messages.ERROR.VALIDATION_FAILED';
    const args = this.safeParseArgs(rawArgs);

    const translated = await Promise.resolve(
      i18n?.t(key as Parameters<I18nContext['t']>[0], {
        lang,
        args,
        defaultValue: key,
      }),
    );

    if (typeof translated === 'string' && translated && translated !== key) {
      return translated;
    }

    if (key.startsWith('messages.')) {
      return ERROR_MESSAGES.VALIDATION_FAILED;
    }

    return key;
  }

  private safeParseArgs(payload?: string): Record<string, unknown> | undefined {
    if (!payload) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(payload);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : undefined;
    } catch (error) {
      return undefined;
    }
  }

  private resolveLanguage(host: ArgumentsHost): string {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<{ query?: Record<string, unknown>; headers?: Record<string, unknown> }>();
    const i18n = I18nContext.current(host);

    const queryLang = (request?.query?.lang as string | undefined)?.toLowerCase();
    const headerLang = this.pickHeaderValue(request?.headers?.['x-lang'])?.toLowerCase();
    const acceptLanguage = request?.headers?.['accept-language'];
    const acceptPrimary = typeof acceptLanguage === 'string'
      ? acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase()
      : undefined;

    return (
      i18n?.lang ??
      queryLang ??
      headerLang ??
      acceptPrimary ??
      'ro'
    );
  }

  private pickHeaderValue(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    if (typeof value === 'string') {
      return value;
    }
    return undefined;
  }
}