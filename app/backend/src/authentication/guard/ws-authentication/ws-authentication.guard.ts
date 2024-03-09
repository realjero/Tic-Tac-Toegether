import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtHelperService } from '../../services/jwt-helper/jwt-helper.service';

@Injectable()
export class WsAuthenticationGuard implements CanActivate {
    constructor(private jwtHelperService: JwtHelperService) {}

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

    private rejectConnection(client: Socket, errorMessage: string) {
        console.error(`Connection rejected: ${errorMessage}`);
        client.emit('error', errorMessage); // Inform the client about the rejection reason
        client.disconnect(); // Disconnect the client
    }
}
