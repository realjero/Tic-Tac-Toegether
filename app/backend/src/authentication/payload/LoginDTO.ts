import { IsNotEmpty, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

/**
 * `LoginDTO` is a data transfer object that encapsulates the user credentials required for logging in.
 * It includes properties for `username` and `password` with validation rules to ensure that they are
 * provided and are of type string.
 *
 * @ApiProperty Decorators provide metadata for Swagger documentation, including descriptions and examples.
 * @IsString and @IsNotEmpty Decorators from the `class-validator` package enforce that the properties are non-empty strings.
 */
export class LoginDTO {
    @ApiProperty({
        description: 'The username of the user',
        example: 'john_doe',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'strongPassword123!',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
