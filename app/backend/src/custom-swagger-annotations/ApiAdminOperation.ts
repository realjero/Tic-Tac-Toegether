import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiForbiddenResponse } from '@nestjs/swagger';

/**
 * `AdminApiOperation` is a custom method decorator designed to enhance Swagger/OpenAPI documentation for
 * specific API endpoints that are restricted to admin users. It combines the `ApiOperation` decorator with
 * an `ApiForbiddenResponse` to clearly indicate that the endpoint requires admin privileges and will return
 * a forbidden response if accessed by non-admin users.
 *
 * @param {string} summary - A brief summary of the endpoint's purpose or action, for display in the API documentation.
 * @param {string} description - A detailed description of the endpoint, which will be appended with a notice about admin-only access.
 * @returns {MethodDecorator} - A composite decorator that applies both the operation details and the forbidden response documentation.
 */
export function AdminApiOperation(summary: string, description: string): MethodDecorator {
    return applyDecorators(
        ApiOperation({
            summary,
            description: `${description} Access is restricted to admin users only.`,
        }),
        ApiForbiddenResponse({ description: 'Access forbidden. This route is restricted to admin users.' })
    );
}
