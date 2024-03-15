import {Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtKey } from '../../constants';

/**
 * `JwtHelperService` is a service class that encapsulates functionality related to JWT (JSON Web Tokens)
 * operations, including token generation and verification. It relies on NestJS's `JwtService` to perform
 * the underlying JWT tasks.
 *
 * @Injectable Decorator that marks this class as a provider within the NestJS dependency injection system,
 * allowing it to be injected into other classes as needed.
 */
@Injectable()
export class JwtHelperService {
    /**
     * Constructs a new instance of `JwtHelperService` with a dependency on `JwtService`.
     *
     * @param jwtService - An instance of `JwtService` used for signing and verifying JWTs.
     */
    constructor(private jwtService: JwtService) {}

    /**
     * Generates a JWT token asynchronously for a given user ID. The `userId` is included in the payload
     * of the token.
     *
     * @param {number} userId - The unique identifier of the user for whom the token is generated.
     * @returns {Promise<string>} - A promise that resolves to the generated JWT token as a string.
     */
    async generateJWTToken(userId: number): Promise<string> {
        return await this.jwtService.signAsync({ userId: userId });
    }

    /**
     * Verifies the validity of a JWT token asynchronously. It checks the token's signature and payload
     * against the provided secret. If the token is invalid or expired, an `UnauthorizedException` is thrown.
     *
     * @param {string} token - The JWT token to be verified.
     * @returns {Promise<any>} - A promise that resolves to the decoded token payload if verification succeeds.
     * @throws {UnauthorizedException} - Thrown if the token is invalid, expired, or verification fails for any other reason.
     */
    async verifyJWTToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: jwtKey.secret,
            });
        } catch (error) {
            throw new UnauthorizedException('expired token');
        }
    }
}
