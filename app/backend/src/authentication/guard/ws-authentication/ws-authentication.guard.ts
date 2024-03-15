import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtHelperService } from '../../services/jwt-helper/jwt-helper.service';

/**
 * `WsAuthenticationGuard` is a custom guard for WebSocket connections that implements the
 * `CanActivate` interface from NestJS. It is designed to authenticate WebSocket clients using
 * JWT tokens. The guard validates the token provided by the client during the WebSocket
 * handshake process and ensures it is valid before allowing the connection to proceed.
 *
 * @Injectable Decorator that marks the class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 * @implements {CanActivate} - This guard implements the `CanActivate` interface to be used in the context
 * of route handling to determine if a request is permitted to proceed.
 */
@Injectable()
export class WsAuthenticationGuard implements CanActivate {
    /**
     * Injects the `JwtHelperService` dependency for JWT token verification.
     *
     * @param jwtHelperService - An instance of `JwtHelperService` used for validating JWT tokens.
     */
    constructor(private jwtHelperService: JwtHelperService) {}


    /**
     * Determines if a WebSocket client is allowed to establish a connection based on the validity of
     * the JWT token provided during the handshake process.
     *
     * @param {ExecutionContext} context - The execution context providing details about the WebSocket connection attempt.
     * @returns {Promise<boolean>} - A promise that resolves to `true` if the token is valid and the connection is allowed,
     * or `false` if the token is invalid or not provided, in which case the connection is rejected.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const token = client.handshake.auth?.token;

        if (!token) {
            this.rejectConnection(client, 'No authorization token');
            return false;
        }

        const [bearer, actualToken] = token.split(' ');

        if (bearer !== 'Bearer' || !actualToken) {
            this.rejectConnection(client, 'Invalid token format');
            return false;
        }

        try {
            client.data.user = await this.jwtHelperService.verifyJWTToken(actualToken);
            return true;
        } catch (error) {
            console.log(error)
            this.rejectConnection(client, 'Invalid token');
            return false;
        }
    }

    /**
     * Rejects the WebSocket connection attempt, providing a reason for the rejection. This method
     * logs the rejection reason to the server console, informs the client of the rejection reason via an
     * 'error' event, and then disconnects the client.
     *
     * @param {Socket} client - The WebSocket client attempting to connect.
     * @param {string} errorMessage - A message describing the reason for rejecting the connection.
     */
    private rejectConnection(client: Socket, errorMessage: string) {
        console.error(`Connection rejected: ${errorMessage}`);
        client.emit('error', errorMessage); // Inform the client about the rejection reason
        client.disconnect(); // Disconnect the client
    }
}
