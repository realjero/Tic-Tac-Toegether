import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Post,
    UnauthorizedException,
    UseFilters,
} from '@nestjs/common';
import { RegisterDTO } from '../payload/RegisterDTO';
import { TokenResponseDTO } from '../payload/TokenResponseDTO';
import { UserService as UserServiceDatabase } from '../../database/services/user/user.service';
import { PasswordService } from '../services/password/password.service';
import { LoginDTO } from '../payload/LoginDTO';
import { Public } from '../decorators/Public';
import { ValidationExceptionFilter } from '../filters/validation-exception/validation-exception.filter';
import { JwtHelperService } from '../services/jwt-helper/jwt-helper.service';
import {UserEloRatingService as UserEloRatingServiceDatabase } from "../../database/services/user-elo-rating/user-elo-rating.service";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse, ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {ApiPublicOperation} from "../../custom-swagger-annotations/ApiPublicOperation";


/**
 * AuthenticationController is responsible for handling user authentication, including
 * user registration and login. It utilizes various services to perform its tasks, such as
 * `UserServiceDatabase` for user management, `UserEloRatingServiceDatabase` for managing user
 * Elo ratings, `PasswordService` for password-related operations, and `JwtHelperService` for
 * JWT token generation and validation.
 *
 * @ApiTags Decorator that associates this controller with the 'Authentication' tag in the OpenAPI documentation.
 * @Controller Decorator that declares this class as a NestJS controller with a base route of 'api/v1'.
 * @UseFilters Decorator that applies the `ValidationExceptionFilter` to all routes within the controller, to handle validation exceptions.
 */
@ApiTags('Authentication')
@Controller('api/v1')
@UseFilters(ValidationExceptionFilter)
export class AuthenticationController {
    /**
     * Constructor to inject dependencies into the AuthenticationController.
     *
     * @param userServiceDatabase - Service to interact with the user-related database operations.
     * @param userEloServiceDatabase - Service to manage user Elo ratings in the database.
     * @param passwordService - Service to handle password security and hashing.
     * @param jwtHelper - Service to generate and validate JWT tokens.
     */
    constructor(
        private userServiceDatabase: UserServiceDatabase,
        private userEloServiceDatabase: UserEloRatingServiceDatabase,
        private passwordService: PasswordService,
        private jwtHelper: JwtHelperService
    ) {}


    /**
     * Handles the registration of a new user. Validates the provided user details and,
     * if valid, creates a new user record along with an initial Elo rating. A JWT token is
     * then generated and returned to the client.
     *
     * @Public Decorator that marks this method as publicly accessible, bypassing any global authentication guards.
     * @ApiPublicOperation Decorator that provides a description for the register operation in the OpenAPI documentation.
     * @ApiBody Decorator that specifies the expected structure of the request body.
     * @ApiCreatedResponse Decorator that documents the successful response structure and status code.
     * @ApiBadRequestResponse Decorator that documents the response structure and status code for bad requests.
     * @HttpCode Decorator that sets the HTTP status code to CREATED (201) for successful requests.
     * @Post Decorator that maps HTTP POST requests to this method.
     *
     * @param registerDTO - The data transfer object containing the user registration details.
     * @returns A promise that resolves to an object containing the access token.
     */
    @Public()
    @ApiPublicOperation('Register a new user')
    @ApiBody({ type: RegisterDTO })
    @ApiCreatedResponse({
        description: 'User registered successfully',
        type: TokenResponseDTO,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() registerDTO: RegisterDTO): Promise<TokenResponseDTO> {
        if ((await this.userServiceDatabase.findUserByUsername(registerDTO.username)) !== null)
            throw new BadRequestException({
                message: ['username: Username already exists'],
            });

        if (!this.passwordService.checkPasswordSecurity(registerDTO.password)) {
            throw new BadRequestException({
                message: [
                    'password: Please make sure you are using at least 1x digit, 1x capitalized and 1x lower-case letter and at least 1x symbol from the following pool: ~`! @#$%^&*()_-+={[}]|:;<,>.?/',
                ],
            });
        }

        const user = await this.userServiceDatabase.saveUser(registerDTO.username, await this.passwordService.hashPassword(registerDTO.password));
        if (!user) throw new InternalServerErrorException('user could not be created');

        await this.userEloServiceDatabase.saveUserEloRating(user.id, 1000); // init value for each user

        return new TokenResponseDTO(await this.jwtHelper.generateJWTToken(user.id));
    }

    /**
     * Handles user login. It checks the provided credentials against the stored records and,
     * if authenticated, generates and returns a JWT token.
     *
     * @Public Decorator that marks this method as publicly accessible, bypassing any global authentication guards.
     * @ApiPublicOperation Decorator that provides a description for the login operation in the OpenAPI documentation.
     * @ApiBody Decorator that specifies the expected structure of the request body for login.
     * @ApiOkResponse Decorator that documents the successful response structure and status code.
     * @ApiUnauthorizedResponse Decorator that documents the response structure and status code for unauthorized requests.
     * @HttpCode Decorator that sets the HTTP status code to OK (200) for successful login attempts.
     * @Post Decorator that maps HTTP POST requests to this method, specifically for the 'login' route.
     *
     * @param loginDTO - The data transfer object containing the user login details.
     * @returns A promise that resolves to an object containing the access token.
     */
    @Public()
    @ApiPublicOperation('Login a user')
    @ApiBody({ type: LoginDTO })
    @ApiOkResponse({
        description: 'User logged in successfully',
        type: TokenResponseDTO,
    })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDTO: LoginDTO): Promise<TokenResponseDTO> {
        const user = await this.userServiceDatabase.findUserByUsername(loginDTO.username);
        if (!user || !(await this.passwordService.arePasswordsEqual(loginDTO.password, user.password))) throw new UnauthorizedException();

        return new TokenResponseDTO(await this.jwtHelper.generateJWTToken(user.id));
    }
}
