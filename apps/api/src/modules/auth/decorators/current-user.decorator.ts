import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ActiveUser } from '../interfaces/active-user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActiveUser | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: ActiveUser }>();
    return request.user;
  },
);
