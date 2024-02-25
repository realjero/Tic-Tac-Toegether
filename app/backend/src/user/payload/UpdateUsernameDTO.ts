import { IsString, Length } from 'class-validator';

export class UpdateUsernameDTO {
    @IsString({ message: 'Username must be a string' })
    @Length(6, 64, {
        message: 'Username must be between 6 and 64 characters long',
    })
    username: string;
}
