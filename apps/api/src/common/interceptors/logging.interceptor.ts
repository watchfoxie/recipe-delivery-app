import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
  const request = context.switchToHttp().getRequest<Request>();
    const method = request?.method ?? 'UNKNOWN';
    const url = request?.url ?? 'UNKNOWN';
    const startedAt = new Date().toISOString();
    console.log(`[${startedAt}] ${method} ${url} - START`);

    return next.handle().pipe(
      tap({
        next: () => {
          const finishedAt = new Date().toISOString();
          console.log(`[${finishedAt}] ${method} ${url} - SUCCESS`);
        },
        error: (error) => {
          const finishedAt = new Date().toISOString();
          console.log(
            `[${finishedAt}] ${method} ${url} - ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        },
      }),
    );
  }
}
