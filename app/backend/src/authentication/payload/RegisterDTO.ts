import {IsString, Length} from "class-validator";

export class RegisterDTO {
    @IsString({ message: 'Username must be a string' })
    @Length(6, 64, { message: 'Username must be between 6 and 64 characters long' })
    username: string;

    @IsString({ message: 'Password must be a string' })
    @Length(8, 72, { message: 'Password must be between 8 and 72 characters long' })
    password: string;
}
