import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exceptionResponse;

    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
    };

    if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any).error &&
      status === HttpStatus.BAD_REQUEST
    ) {
      errorResponse.error = (exceptionResponse as any).error;
      if ((exceptionResponse as any).message && Array.isArray((exceptionResponse as any).message)) {
        errorResponse.message = (exceptionResponse as any).message;
      }
    }

    response.status(status).json(errorResponse);
  }
}

