import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param, ParseIntPipe,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import {UserDTO} from "../../payload/UserDTO";
import {UserService} from "../../services/user/user.service";
import {UpdateUsernameDTO} from "../../payload/UpdateUsernameDTO";
import {UserEntity} from "../../../database/models/UserEntity";
import {IsAdminGuard} from "../../guard/is-admin/is-admin.guard";

@Controller('api/v1/profiles')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Get('own')
    @HttpCode(HttpStatus.OK)
    async getOwnProfile(@Request() req): Promise<UserDTO> {
       return this.getProfile(req.user.userId);
    }

    @Post('own')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOwnProfileUsername(@Request() req, @Body() updateUsernameDTO: UpdateUsernameDTO): Promise<void> {
        const result: UserEntity | undefined = await this.userService.updateUserName(req.user.userId, updateUsernameDTO.username);
        if(!result) {
            throw new NotFoundException("User was not found");
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(IsAdminGuard)
    async getProfile(@Param("id", ParseIntPipe) requestedId: number): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUserIdToUserDTO(requestedId);
        if(!result) {
            throw new NotFoundException("User was not found");
        }
        return result;
    }
}
