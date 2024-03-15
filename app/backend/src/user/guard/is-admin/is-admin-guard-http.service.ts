import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../../../database/services/user/user.service';

/**
 * `IsAdminGuardHttp` is a guard used to restrict access to certain routes to admin users only. It intercepts
 * incoming HTTP requests and checks if the authenticated user has admin privileges. If not, it throws a
 * `ForbiddenException`, effectively preventing non-admin users from accessing protected routes.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 * @implements {CanActivate} Interface indicating this class is a guard that can determine if a route can be activated.
 */
@Injectable()
export class IsAdminGuardHttp implements CanActivate {
    /**
     * Constructs a new instance of `IsAdminGuardHttp` with the necessary dependencies.
     *
     * @param {UserService} userServiceDatabase - The user service used to check if a user has admin privileges.
     */
    constructor(private userServiceDatabase: UserService) {}

    /**
     * Determines if the current route can be activated based on the admin status of the authenticated user.
     * It retrieves the user information from the request object and uses the user service to check their
     * admin status. If the user is not an admin, it throws a `ForbiddenException`.
     *
     * @param {ExecutionContext} context - The context of the execution, providing access to details about the current request.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the route can be activated (user is an admin) or
     * throws a `ForbiddenException` if the user is not an admin.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !(await this.userServiceDatabase.isUserAdmin(user.userId))) {
            throw new ForbiddenException('You need admin privileges to access this route');
        }

        return true;
    }
}
