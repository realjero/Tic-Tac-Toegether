import {BadRequestException, Body, Controller, InternalServerErrorException, Post} from '@nestjs/common';
import {LoginRegisterDTO} from "../payload/LoginRegisterDTO";
import {UserService} from "../../database/services/user/user.service";
import {PasswordService} from "../services/password/password.service";
import * as bcrypt from "bcrypt";
@Controller('api/v1')
export class AuthenticationController {
    constructor(
        private userService: UserService,
        private passwordService: PasswordService
    ) {}

    @Post('register')
    async register(@Body() registerDTO: LoginRegisterDTO): Promise<void> {
        if (await this.userService.findUserByUsername(registerDTO.username) !== null)
            throw new BadRequestException("Username already exists");

        if(!this.passwordService.checkPasswordSecurity(registerDTO.password)) {
            throw new BadRequestException("Please make sure you are using at least 1x digit, 1x capitalized and 1x lower-case letter and at least 1x symbol from the following pool: ~`! @#$%^&*()_-+={[}]|:;<,>.?/");
        }

        const user = await this.userService.saveUser(registerDTO.username, await bcrypt.hash(registerDTO.password, 10));
        if (!user) throw new InternalServerErrorException("user could not be created");
    }
}
