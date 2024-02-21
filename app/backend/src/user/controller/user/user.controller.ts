import {Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Post, Request} from '@nestjs/common';
import {UserDTO} from "../../payload/UserDTO";
import {UserService} from "../../services/user/user.service";
import {UpdateUsernameDTO} from "../../payload/UpdateUsernameDTO";
import {UserEntity} from "../../../database/models/UserEntity";

@Controller('api/v1/account')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getOwnProfile(@Request() req): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUserIdToUserDTO(req.user.userId);
        if(!result) {
            throw new NotFoundException("User was not found");
        }
        return result;
    }

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateOwnProfileUsername(@Request() req, @Body() updateUsernameDTO: UpdateUsernameDTO): Promise<void> {
        const result: UserEntity | undefined = await this.userService.updateUserName(req.user.userId, updateUsernameDTO.username);
        if(!result) {
            throw new NotFoundException("User was not found");
        }
    }
}
