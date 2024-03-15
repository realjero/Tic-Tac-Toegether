import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../../decorators/Public';
import { JwtHelperService } from '../../services/jwt-helper/jwt-helper.service';

/**
 * `HttpAuthenticationGuard` is a custom guard that implements NestJS's `CanActivate` interface.
 * It is used to determine whether a given request has permission to proceed to the route handler.
 * This guard checks for JWT tokens in the request headers to authenticate requests. It also supports
 * bypassing authentication for publicly accessible routes, identified by a custom `Public` decorator.
 *
 * @Injectable Decorator that marks the class as a provider that can be injected, making it available
 * to the NestJS dependency injection system.
 * @implements {CanActivate} - Implements the `CanActivate` interface to conform to NestJS's guard structure.
 */
@Injectable()
export class HttpAuthenticationGuard implements CanActivate {
    /**
     * Injects dependencies required by the guard.
     *
     * @param jwtHelperService - An instance of `JwtHelperService` to perform JWT operations like verification.
     * @param reflector - An instance of `Reflector`, a NestJS utility to retrieve metadata from classes and methods.
     */
    constructor(
        private jwtHelperService: JwtHelperService,
        private reflector: Reflector
    ) {}

    /**
     * Determines if the current request can proceed to the route handler based on authentication status.
     * If the target route is marked as public, it bypasses authentication checks. Otherwise, it attempts
     * to extract and verify the JWT from the request's authorization header.
     *
     * @param {ExecutionContext} context - Provides details about the current request context, including the request handler and the execution class.
     * @returns {Promise<boolean>} - A promise that resolves to `true` if the request is authenticated or targets a public route, otherwise throws an `UnauthorizedException`.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        //Check if route is public
        const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        if (isPublic) {
            return true;
        }

        // Check if jwt is valid
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        request['user'] = await this.jwtHelperService.verifyJWTToken(token);

        return true;
    }

    /**
     * Extracts the JWT token from the request's authorization header. The expected format is `Bearer <token>`.
     *
     * @param {Request} request - The incoming request object from which to extract the JWT token.
     * @returns {string | undefined} - The extracted JWT token if present and properly formatted; otherwise, `undefined`.
     */
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
