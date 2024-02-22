import { IsString, Length } from 'class-validator';

export class UpdatePasswordDTO {
  @IsString({ message: 'password: Password must be a string' })
  @Length(8, 72, {
    message: 'password: Password must be between 8 and 72 characters long',
  })
  newPassword: string;
}
