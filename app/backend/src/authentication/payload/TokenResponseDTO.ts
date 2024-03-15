import {ApiProperty} from "@nestjs/swagger";

/**
 * `TokenResponseDTO` is a data transfer object that represents the response structure for operations
 * that return a JWT token, such as login and registration. It contains a single `access_token` property
 * that holds the JWT token string.
 *
 * @ApiProperty Decorator provides metadata for the `access_token` property, including an example token and a description.
 */
export class TokenResponseDTO {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'The JWT token',
    })
    access_token: string;


    constructor(access_token: string) {
        this.access_token = access_token;
    }
}
