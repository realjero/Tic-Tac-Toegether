import {
    BadRequestException,
    Body,
    Controller, Get, HttpCode, HttpStatus,
    InternalServerErrorException,
    Request,
    Post, UnauthorizedException, UseGuards
} from '@nestjs/common';
import {RegisterDTO} from "../payload/RegisterDTO";
import { UserService as UserServiceDatabase } from "../../database/services/user/user.service";
import {PasswordService} from "../services/password/password.service";
import * as bcrypt from "bcrypt";
import {JwtService} from "@nestjs/jwt";
import {LoginDTO} from "../payload/LoginDTO";
import {Public} from "../decorators/Public";

@Controller('api/v1')
export class AuthenticationController {
    constructor(
        private userServiceDatabase: UserServiceDatabase,
        private passwordService: PasswordService,
        private jwtService: JwtService
    ) {}

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() registerDTO: RegisterDTO): Promise<{ access_token: string }> {
        if (await this.userServiceDatabase.findUserByUsername(registerDTO.username) !== null)
            throw new BadRequestException("Username already exists");

        if(!this.passwordService.checkPasswordSecurity(registerDTO.password)) {
            throw new BadRequestException("Please make sure you are using at least 1x digit, 1x capitalized and 1x lower-case letter and at least 1x symbol from the following pool: ~`! @#$%^&*()_-+={[}]|:;<,>.?/");
        }

        const user = await this.userServiceDatabase.saveUser(registerDTO.username, await bcrypt.hash(registerDTO.password, 10));
        if (!user) throw new InternalServerErrorException("user could not be created");

        return {
            access_token: await this.jwtService.signAsync({ userId: user.id })
        };
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDTO: LoginDTO): Promise<{ access_token: string }> {
        const user = await this.userServiceDatabase.findUserByUsername(loginDTO.username);
        if(!user || !await bcrypt.compare(loginDTO.password, user.password))
            throw new UnauthorizedException();

        return {
            access_token: await this.jwtService.signAsync({ userId: user.id })
        };
    }
}
