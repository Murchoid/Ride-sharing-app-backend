import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'Email of user',
    example: 'Murchoid@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of user',
    example: 'Murchoid123',
  })
  @IsString()
  password: string;
}
