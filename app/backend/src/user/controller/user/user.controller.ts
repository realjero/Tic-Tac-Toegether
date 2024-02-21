import {Controller, Get, HttpCode, HttpStatus, NotFoundException, Request} from '@nestjs/common';
import {UserDTO} from "../../payload/UserDTO";
import {UserService} from "../../services/user/user.service";

@Controller('api/v1/account')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getOwnProfile(@Request() req): Promise<UserDTO> {
        const result: UserDTO | undefined = await this.userService.transformUserIdToUserDTO(req.user.sub);
        if(!result) {
            throw new NotFoundException("User was not found");
        }
        return result;
    }
}
