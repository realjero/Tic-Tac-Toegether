import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

/**
 * `ApiPublicOperation` is a custom method decorator aimed at enhancing Swagger/OpenAPI documentation for
 * API endpoints that are publicly accessible, i.e., do not require authentication. It utilizes the
 * `ApiOperation` decorator to provide a summary and, optionally, a more detailed description that is
 * appended with a note indicating the public nature of the endpoint.
 *
 * @param {string} summary - A concise summary of what the endpoint does, intended for display in API documentation.
 * @param {string} [description] - An optional detailed description of the endpoint. If provided, it will include a note on the endpoint being public.
 * @returns {MethodDecorator} - A decorator that applies the operation details to the endpoint for documentation purposes.
 */
export function ApiPublicOperation(summary: string, description?: string): MethodDecorator {
    return applyDecorators(
        ApiOperation({
            summary: summary,
            description: description ? `${description} (This endpoint is public.)` : 'This endpoint is public.',
        })
    );
}
