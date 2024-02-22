import {ArgumentsHost, BadRequestException, Catch, ExceptionFilter} from '@nestjs/common';
import { Response } from 'express';

interface ValidationErrorResponse {
  statusCode: number;
  message: string[];
  error: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse() as ValidationErrorResponse;

    let errors = {};

    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      exceptionResponse.message.forEach((message: string) => {
        const [fieldError, errorMessage] = message.split(/: (.+)/);
        errors[fieldError] = errorMessage;
      });
    }

    response.status(status).json({
      statusCode: status,
      error: errors,
    });
  }
}
