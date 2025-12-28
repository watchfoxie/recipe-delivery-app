import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUser } from '../interfaces/active-user.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: ActiveUser | false | null) {
    if (err || !user) {
      const message = this.translate('auth.ERROR.UNAUTHORIZED');
      throw new UnauthorizedException(message);
    }
    return user;
  }

  getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }

  private translate(key: string): string {
    const ctx = I18nContext.current();
    const translated = ctx?.t(key as Parameters<I18nContext['t']>[0], { lang: ctx?.lang });
    if (typeof translated === 'string') {
      return translated;
    }

    return 'Authentication required';
  }
}
