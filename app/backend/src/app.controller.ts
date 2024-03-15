import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './authentication/decorators/Public';
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {ApiPublicOperation} from "./custom-swagger-annotations/ApiPublicOperation";

/**
 * `AppController` is designed to serve the frontend application from the NestJS backend. This controller
 * includes a catch-all route that serves the static frontend files.
 *
 * @ApiTags Decorator that associates this controller with the 'Serve Frontend' tag in the OpenAPI documentation,
 * indicating its primary role in serving the frontend application.
 * @Controller Decorator that declares this class as a NestJS controller. As no route path is specified,
 * this controller applies to the root of the application.
 */
@ApiTags('Serve Frontend')
@Controller()
export class AppController {
    /**
     * The `catchAll` method is a catch-all route handler intended to serve the main entry point of the
     * frontend application for any requested path. This enables client-side routing by always returning
     * the `index.html` file of the frontend application, regardless of the specific route requested.
     *
     * @Public Decorator indicating that this route is public and does not require authentication.
     * @ApiPublicOperation Custom decorator providing a summary and description for the operation in Swagger documentation,
     * emphasizing its public nature and role in serving the frontend application.
     * @ApiResponse Decorator documenting the successful response for this route in Swagger.
     * @Get Decorator that maps all GET requests to this method, effectively making it a catch-all route.
     * @param {Response} response - The Express response object, used to send the `index.html` file to the client.
     */
    @Public()
    @ApiPublicOperation('Serve Frontend Application', 'Catch-all route to serve the frontend application.')
    @ApiResponse({
        status: 200,
        description: 'Frontend application served successfully.'
    })
    @Get()
    catchAll(@Res() response: Response) {
        response.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    }
}
