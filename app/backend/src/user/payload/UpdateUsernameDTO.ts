import { IsString, Length } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

/**
 * `UpdateUsernameDTO` is a data transfer object used for updating a user's username. It includes
 * validation for the new username to ensure it is a string and falls within the specified character length limits.
 *
 * @class UpdateUsernameDTO
 */
export class UpdateUsernameDTO {
    @ApiProperty({
        description: 'The new username',
        minLength: 6,
        maxLength: 64,
        example: 'new_username',
    })
    @IsString({ message: 'Username must be a string' })
    @Length(6, 64, {
        message: 'Username must be between 6 and 64 characters long',
    })
    username: string;
}
