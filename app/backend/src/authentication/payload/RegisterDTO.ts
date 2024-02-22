import {IsString, Length} from "class-validator";

export class RegisterDTO {
    @IsString({ message: 'username: Username must be a string' })
    @Length(6, 64, { message: 'username: Username must be between 6 and 64 characters long' })
    username: string;

    @IsString({ message: 'password: Password must be a string' })
    @Length(8, 72, { message: 'password: Password must be between 8 and 72 characters long' })
    password: string;
}
