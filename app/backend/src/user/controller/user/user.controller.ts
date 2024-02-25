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
    ParseIntPipe,
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
import { IsAdminGuard } from '../../guard/is-admin/is-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UtilsService } from '../../services/utils/utils.service';
import { ValidationExceptionFilter } from '../../../authentication/filters/validation-exception/validation-exception.filter';
import { PasswordService } from '../../../authentication/services/password/password.service';
import { UpdatePasswordDTO } from '../../payload/UpdatePasswordDTO';

@Controller('api/v1/profiles')
@UseFilters(ValidationExceptionFilter)
export class UserController {
    constructor(
        private userService: UserService,
        private utilsService: UtilsService,
        private passwordService: PasswordService
    ) {}

    @Get('own')
    @HttpCode(HttpStatus.OK)
    async getOwnProfile(@Request() req): Promise<UserDTO> {
        return this.getProfile(req.user.userId);
    }

    @Put('own')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOwnProfileUsername(@Request() req, @Body() updateUsernameDTO: UpdateUsernameDTO): Promise<void> {
        if(await this.userService.doesUserNameExist(updateUsernameDTO.username))
            throw new BadRequestException({
                message: ['username: Username already exists'],
            });

        const result: UserEntity | undefined = await this.userService.updateUserName(req.user.userId, updateUsernameDTO.username);
        if (!result) {
            throw new NotFoundException();
        }
    }

    @Get(':userId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(IsAdminGuard)
    async getProfile(@Param('userId', ParseIntPipe) requestedId: number): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUserIdToUserDTO(requestedId);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }

    @Put('own/image')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<void> {
        if (!this.utilsService.getImageFormat(file.buffer)) {
            throw new UnsupportedMediaTypeException();
        }

        const user = await this.userService.saveImage(req.user.userId, file);
        if (user === undefined || user.image === undefined) throw new InternalServerErrorException();
    }

    @Get('own/image')
    async getOwnImage(@Request() req, @Res() res): Promise<void> {
        return await this.getImage(req.user.userId, res);
    }

    @Get('by-id/:userId/image')
    @UseGuards(IsAdminGuard)
    async getImage(@Param('userId') userId: number, @Res() res): Promise<void> {
        const image: Buffer = await this.userService.getImageByUserId(userId);
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

    @Get('by-username/:username/image')
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

        const user = await this.userService.updateUserPassword(req.user.userId, await this.passwordService.hashPassword(updatePasswordDTO.newPassword));
        if (!user) throw new InternalServerErrorException('user could not be created');
    }
}
