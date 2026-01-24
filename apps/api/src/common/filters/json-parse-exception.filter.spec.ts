import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { JsonParseExceptionFilter } from './json-parse-exception.filter';

describe('JsonParseExceptionFilter', () => {
  let filter: JsonParseExceptionFilter;

  beforeEach(() => {
    filter = new JsonParseExceptionFilter();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should format JSON parse errors with localized message', () => {
    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn();
    const res = {
      status: statusMock,
      json: jsonMock,
    } as { status: jest.Mock; json: jest.Mock };
    const req = {
      query: {},
      headers: {},
      cookies: {},
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => req,
      }),
    } as unknown as ArgumentsHost;

    const i18nMock = {
      lang: 'ro',
      t: (key: string) =>
        key === 'messages.ERROR.VALIDATION_FAILED'
          ? 'Validarea a eșuat'
          : 'Corpul cererii conține JSON invalid',
      service: {
        hbsHelper: () => '',
      },
    } as const;

    jest
      .spyOn(I18nContext as unknown as { current: jest.Mock }, 'current')
      .mockReturnValue(i18nMock as unknown as I18nContext);

    filter.catch(new BadRequestException('Unexpected token'), host);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: [
        {
          field: 'json_body',
          message: 'Validarea a eșuat: Corpul cererii conține JSON invalid',
        },
      ],
    });
  });

  it('should rethrow non JSON errors', () => {
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({}),
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;

    jest
      .spyOn(I18nContext as unknown as { current: jest.Mock }, 'current')
      .mockReturnValue(
        {
          lang: 'ro',
          t: () => 'any',
          service: { hbsHelper: () => '' },
        } as unknown as I18nContext,
      );

    expect(() => filter.catch(new Error('Other error'), host)).toThrow('Other error');
  });
});