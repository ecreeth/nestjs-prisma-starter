import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  message: string;
  status: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let error: ErrorResponse;
    const message = exception?.response?.message || exception.message;

    if (exception instanceof HttpException) {
      error = { status: exception.getStatus(), message };
    } else {
      error = { message, status: HttpStatus.INTERNAL_SERVER_ERROR };
    }

    if (error.status === HttpStatus.INTERNAL_SERVER_ERROR) {
      // TODO: report production errors
    }

    response.status(error.status).json({
      path: request.url,
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      message: error.message,
    });
  }
}
