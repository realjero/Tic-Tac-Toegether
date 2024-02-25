import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../../decorators/Public';
import { JwtHelperService } from '../../services/jwt-helper/jwt-helper.service';

@Injectable()
export class HttpAuthenticationGuard implements CanActivate {
    constructor(
        private jwtHelperService: JwtHelperService,
        private reflector: Reflector
    ) {}
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
        request['user'] = this.jwtHelperService.verifyJWTToken(token);
        try {
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
