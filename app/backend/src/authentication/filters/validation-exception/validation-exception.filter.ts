import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

/**
 * `ValidationErrorResponse` interface defines the structure for validation error responses.
 * It's used to provide a consistent response format when validation errors occur.
 *
 * @interface
 * @property {number} statusCode - The HTTP status code of the error response.
 * @property {string[]} message - An array of error messages, often detailing validation failures.
 * @property {string} error - A brief description of the type of error, e.g., 'Bad Request'.
 */
interface ValidationErrorResponse {
    statusCode: number;
    message: string[];
    error: string;
}

/**
 * `ValidationExceptionFilter` is an exception filter designed to catch and process `BadRequestException`
 * instances, specifically those that arise from validation errors. It formats the exception details into
 * a more client-friendly structure that lists each validation error separately.
 *
 * This filter is intended to be used with routes where input validation is performed, and it helps to
 * return detailed and structured validation error information to the client, enhancing the API's usability.
 *
 * @Catch Decorator that binds the filter to `BadRequestException`, ensuring it only catches this type of exception.
 * @implements {ExceptionFilter} - Implements the `ExceptionFilter` interface from NestJS to ensure compliance with NestJS's exception handling mechanism.
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse() as ValidationErrorResponse;

        const errors = {};

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
