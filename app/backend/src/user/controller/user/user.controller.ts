import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Put,
    Req,
    Request,
    Res,
    UnsupportedMediaTypeException,
    UploadedFile,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserDTO } from '../../payload/UserDTO';
import { UserService } from '../../services/user/user.service';
import { UpdateUsernameDTO } from '../../payload/UpdateUsernameDTO';
import { UserEntity } from '../../../database/models/UserEntity';
import { IsAdminGuardHttp } from '../../guard/is-admin/is-admin-guard-http.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UtilsService } from '../../services/utils/utils.service';
import { ValidationExceptionFilter } from '../../../authentication/filters/validation-exception/validation-exception.filter';
import { PasswordService } from '../../../authentication/services/password/password.service';
import { UpdatePasswordDTO } from '../../payload/UpdatePasswordDTO';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiNoContentResponse,
    ApiForbiddenResponse,
    ApiUnsupportedMediaTypeResponse
} from '@nestjs/swagger';
import {GameHistoryDTO} from "../../payload/GameHistoryDTO";
import {UsernameEloDTO} from "../../../tictactoe/payload/UsernameEloDTO";
import {AdminApiOperation} from "../../../custom-swagger-annotations/ApiAdminOperation";

/**
 * `UserController` manages user profile related operations such as retrieving, updating user profiles,
 * and uploading user images. It ensures secure access to user's own profile and admin-only access to
 * other users' profiles. It utilizes services for user management, utility functions, and password handling.
 *
 * @ApiTags Decorator that associates this controller with the 'User Profiles' tag in the OpenAPI documentation.
 * @ApiBearerAuth Decorator that indicates these endpoints require Bearer Token authentication in Swagger documentation.
 * @Controller Decorator that declares this class as a NestJS controller with a base route of 'api/v1/profiles'.
 * @UseFilters Decorator that applies the `ValidationExceptionFilter` to all routes within the controller for handling validation exceptions.
 */
@ApiTags('User Profiles')
@ApiBearerAuth()
@Controller('api/v1/profiles')
@UseFilters(ValidationExceptionFilter)
export class UserController {
    constructor(
        private userService: UserService,
        private utilsService: UtilsService,
        private passwordService: PasswordService
    ) {}

    /**
     * Retrieves the profile of the currently authenticated user.
     *
     * @ApiOperation Decorator providing a summary for the endpoint in Swagger documentation.
     * @ApiOkResponse Decorator documenting the success response structure.
     * @ApiNotFoundResponse Decorator documenting the response for when the user is not found.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the route as 'own'.
     * @HttpCode Decorator setting the HTTP status code to OK for successful requests.
     * @param {Request} req - The incoming request object, used to extract user information.
     * @returns {Promise<UserDTO>} A promise that resolves to the `UserDTO` of the authenticated user.
     */
    @ApiOperation({ summary: 'Get own profile' })
    @ApiOkResponse({ type: UserDTO, description: 'Profile retrieved successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get('own')
    @HttpCode(HttpStatus.OK)
    async getOwnProfile(@Request() req): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUserIdToUserDTO(await this.getUserIdFromPromise(req));
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    /**
     * Updates the username of the currently authenticated user.
     *
     * @ApiOperation Decorator providing a summary for the endpoint in Swagger documentation.
     * @ApiNoContentResponse Decorator documenting the response for a successful username update.
     * @ApiBadRequestResponse Decorator documenting the response for when the requested username already exists.
     * @ApiNotFoundResponse Decorator documenting the response for when the user is not found.
     * @ApiBody Decorator specifying the structure of the expected request body.
     * @Put Decorator that maps HTTP PUT requests to this method, specifying the route as 'own'.
     * @HttpCode Decorator setting the HTTP status code to NO_CONTENT for successful requests.
     * @param {Request} req - The incoming request object, used to extract user information.
     * @param {UpdateUsernameDTO} updateUsernameDTO - The new username to be set for the user.
     */
    @ApiOperation({ summary: 'Update own username' })
    @ApiNoContentResponse({ description: 'Username updated successfully' })
    @ApiBadRequestResponse({ description: 'Username already exists' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiBody({ type: UpdateUsernameDTO })
    @Put('own')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOwnProfileUsername(@Request() req, @Body() updateUsernameDTO: UpdateUsernameDTO): Promise<void> {
        if (await this.userService.doesUserNameExist(updateUsernameDTO.username))
            throw new BadRequestException({
                message: ['username: Username already exists'],
            });

        const result: UserEntity | undefined = await this.userService.updateUserName(await this.getUserIdFromPromise(req), updateUsernameDTO.username);
        if (!result) {
            throw new NotFoundException();
        }
    }

    /**
     * Retrieves the profile of a specific user by their username, accessible only by admin users.
     *
     * @AdminApiOperation Custom decorator providing a summary and description for admin-only access in Swagger documentation.
     * @ApiParam Decorator documenting the path parameter required by the endpoint.
     * @ApiOkResponse Decorator documenting the success response structure.
     * @ApiNotFoundResponse Decorator documenting the response for when the user is not found.
     * @ApiForbiddenResponse Decorator documenting the response for when access is denied.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the dynamic route as ':username'.
     * @HttpCode Decorator setting the HTTP status code to OK for successful requests.
     * @UseGuards Decorator that applies the `IsAdminGuardHttp` to ensure only admin users can access this route.
     * @param {string} username - The username of the user whose profile is being retrieved.
     * @returns {Promise<UserDTO>} A promise that resolves to the `UserDTO` of the requested user.
     */
    @AdminApiOperation('Get user profile by username', 'Retrieves the profile for a specific user by their username.')
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiOkResponse({ description: 'Profile retrieved successfully', type: UserDTO })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiForbiddenResponse({ description: 'You are not allowed to query this route!' })
    @Get(':username')
    @HttpCode(HttpStatus.OK)
    @UseGuards(IsAdminGuardHttp)
    async getProfile(@Param('username') username: string): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUsernameToUserDTO(username);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    /**
     * Allows the currently authenticated user to upload an image for their profile.
     *
     * @ApiOperation Decorator providing a summary for the endpoint in Swagger documentation.
     * @ApiConsumes Decorator specifying the content type expected by the endpoint.
     * @ApiBody Decorator defining the expected format of the request body, including file upload.
     * @ApiNoContentResponse Decorator documenting the response for a successful image upload.
     * @ApiUnsupportedMediaTypeResponse Decorator documenting the response for unsupported media types.
     * @Put Decorator that maps HTTP PUT requests to this method, specifying the route as 'own/image'.
     * @HttpCode Decorator setting the HTTP status code to NO_CONTENT for successful requests.
     * @UseInterceptors Decorator that applies the `FileInterceptor` to handle file upload in the request.
     * @param {Request} req - The incoming request object, used to extract user information.
     * @param {Express.Multer.File} file - The image file uploaded by the user.
     */
    @ApiOperation({ summary: 'Upload user image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiNoContentResponse({ description: 'Image uploaded successfully' })
    @ApiUnsupportedMediaTypeResponse({ description: 'Unsupported media type' })
    @Put('own/image')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<void> {
        if (!this.utilsService.getImageFormat(file.buffer)) {
            throw new UnsupportedMediaTypeException();
        }

        const user = await this.userService.saveImage(await this.getUserIdFromPromise(req), file);
        if (user === undefined || user.image === undefined) throw new InternalServerErrorException();
    }

    /**
     * Retrieves the profile image of a user by their username, sending the image file directly in the response.
     *
     * @ApiOperation Decorator providing a summary for the endpoint in Swagger documentation.
     * @ApiParam Decorator documenting the path parameter required by the endpoint.
     * @ApiOkResponse Decorator documenting the success response structure.
     * @ApiNotFoundResponse Decorator documenting the response for when the user is not found.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the route as ':username/image'.
     * @param {string} username - The username of the user whose image is being retrieved.
     * @param {Response} res - The response object to send the image file.
     */
    @ApiOperation({ summary: 'Get user image by username' })
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiOkResponse({ description: 'Image retrieved successfully' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get(':username/image')
    async getImageByUsername(@Param('username') username: string, @Res() res): Promise<void> {
        const image: Buffer = await this.userService.getImageByUsername(username);
        if (!image) {
            throw new NotFoundException();
        }

        const imageFormat = this.utilsService.getImageFormat(image);
        if (!imageFormat) {
            throw new UnsupportedMediaTypeException();
        }

        res.type(imageFormat);
        res.send(image);
    }

    /**
     * Allows the currently authenticated user to update their password.
     *
     * @ApiOperation Decorator providing a summary for the endpoint in Swagger documentation.
     * @ApiBody Decorator specifying the structure of the expected request body.
     * @ApiNoContentResponse Decorator documenting the response for a successful password update.
     * @ApiBadRequestResponse Decorator documenting the response for when the new password does not meet security requirements.
     * @Put Decorator that maps HTTP PUT requests to this method, specifying the route as 'own/password'.
     * @HttpCode Decorator setting the HTTP status code to NO_CONTENT for successful requests.
     * @param {Request} req - The incoming request object, used to extract user information.
     * @param {UpdatePasswordDTO} updatePasswordDTO - The DTO containing the old and new password for the update operation.
     */
    @ApiOperation({ summary: 'Update user password' })
    @ApiBody({ type: UpdatePasswordDTO })
    @ApiNoContentResponse({ description: 'Password updated successfully' })
    @ApiBadRequestResponse({ description: 'Password does not meet security requirements' })
    @Put('own/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePassword(@Req() req, @Body() updatePasswordDTO: UpdatePasswordDTO) {
        if (!this.passwordService.checkPasswordSecurity(updatePasswordDTO.newPassword)) {
            throw new BadRequestException({
                message: [
                    'password: Please make sure you are using at least 1x digit, 1x capitalized and 1x lower-case letter and at least 1x symbol from the following pool: ~`! @#$%^&*()_-+={[}]|:;<,>.?/',
                ],
            });
        }

        const user = await this.userService.updateUserPassword(
            await this.getUserIdFromPromise(req),
            await this.passwordService.hashPassword(updatePasswordDTO.newPassword)
        );
        if (!user) throw new InternalServerErrorException('user could not be created');
    }

    /**
     * Retrieves the game history of the currently authenticated user.
     *
     * @ApiOperation Decorator providing a summary for the endpoint in Swagger documentation.
     * @ApiOkResponse Decorator documenting the success response structure.
     * @ApiNotFoundResponse Decorator documenting the response for when the user is not found.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the route as 'own/history'.
     * @param {Request} req - The incoming request object, used to extract user information.
     * @returns {Promise<Array>} A promise that resolves to an array of `GameHistoryDTO` objects representing the user's game history.
     */
    @ApiOperation({ summary: 'Get own game history' })
    @ApiOkResponse({ description: 'Game history retrieved successfully', type: GameHistoryDTO, isArray: true })
    @ApiNotFoundResponse({ description: 'User not found' })
    @Get('own/history')
    async getOwnHistory(@Req() req) {
        const userId = await this.getUserIdFromPromise(req);
        if (!userId) throw new NotFoundException();

        return await this.userService.getGameHistoryById(userId);
    }

    /**
     * Retrieves the game history of a specific user by their username, accessible only by admin users.
     *
     * @AdminApiOperation Custom decorator providing a summary and description for admin-only access in Swagger documentation.
     * @ApiParam Decorator documenting the path parameter required by the endpoint.
     * @ApiOkResponse Decorator documenting the success response structure.
     * @ApiForbiddenResponse Decorator documenting the response for when access is denied.
     * @Get Decorator that maps HTTP GET requests to this method, specifying the dynamic route as ':username/history'.
     * @UseGuards Decorator that applies the `IsAdminGuardHttp` to ensure only admin users can access this route.
     * @param {string} username - The username of the user whose game history is being retrieved.
     * @returns {Promise<Array>} A promise that resolves to an array of `GameHistoryDTO` objects representing the user's game history.
     */
    @AdminApiOperation('Get game history by username', 'Retrieves the game history for a specific user by their username.')
    @ApiParam({ name: 'username', type: 'string', required: true, description: 'The username of the user' })
    @ApiOkResponse({ description: 'Game history retrieved successfully', type: GameHistoryDTO, isArray: true })
    @ApiForbiddenResponse({ description: 'You are not allowed to query this route!' })
    @Get(':username/history')
    @UseGuards(IsAdminGuardHttp)
    async getHistoryById(@Param('username') username: string) {
        return await this.userService.getGameHistoryByUsername(username);
    }

    /**
     * Retrieves a list of all users along with their Elo rating, accessible only by admin users.
     *
     * @AdminApiOperation Custom decorator providing a summary and description for admin-only access in Swagger documentation.
     * @ApiOkResponse Decorator documenting the success response structure.
     * @UseGuards Decorator that applies the `IsAdminGuardHttp` to ensure only admin users can access this route.
     * @returns {Promise<Array>} A promise that resolves to an array of `UsernameEloDTO` objects representing all users and their Elo ratings.
     */
    @AdminApiOperation('Get all users', 'Retrieves all users along with their Elo rating.')
    @ApiOkResponse({ description: 'Users retrieved successfully', type: [UsernameEloDTO], isArray: true })
    @UseGuards(IsAdminGuardHttp)
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    /**
     * Utility method to extract the user ID from a request, supporting both synchronous and asynchronous user retrieval.
     *
     * @param {Request} req - The incoming request object.
     * @returns {Promise<number>} A promise that resolves to the user ID of the authenticated user.
     */
    private async getUserIdFromPromise(@Req() req): Promise<number> {
        return (await (req.user instanceof Promise ? req.user : Promise.resolve(req.user))).userId;
    }
}
