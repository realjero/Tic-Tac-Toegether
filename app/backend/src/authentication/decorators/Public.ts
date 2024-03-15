import { SetMetadata } from '@nestjs/common';

/**
 * `PUBLIC_KEY` is a constant used as a metadata key for marking routes as public. Routes marked
 * as public are accessible without requiring authentication. This key is used in conjunction with
 * the `Public` decorator to set route-level metadata.
 *
 * @type {string} The metadata key used to indicate a public route.
 */
export const PUBLIC_KEY = 'isPublic';

/**
 * `Public` is a custom decorator that marks a specific route as public, meaning it can be accessed
 * without authentication. It utilizes NestJS's `SetMetadata` function to associate the `PUBLIC_KEY`
 * with a value of `true`, effectively marking the decorated route as public.
 *
 * The `Public` decorator can be applied to controller methods (route handlers) to indicate that the
 * route does not require the client to be authenticated. This is particularly useful for routes that
 * should be accessible to all users, such as user registration or login endpoints.
 *
 * @returns A decorator function that sets the `isPublic` metadata to `true` for the decorated route.
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
