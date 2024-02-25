import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../../../database/services/user/user.service';

@Injectable()
export class IsAdminGuard implements CanActivate {
    constructor(private userServiceDatabase: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !(await this.userServiceDatabase.isUserAdmin(user.id))) {
            throw new ForbiddenException('You need admin privileges to access this route');
        }

        return true;
    }
}
