import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

enum eUSER {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @ApiProperty({
    description: "Name of user",
    example: "Murchoid"
  })
  @IsString()
  name: string;

   @ApiProperty({
    description: "Email of user",
    example: "Murchoid@gmail.com"
  })
  @IsEmail()
  email: string;

   @ApiProperty({
    description: "password of user",
    example: "Murchoid123"
  })
  @IsString()
  password: string;

   @ApiProperty({
    description: "role of user(ADMIN, CUSTOMER, DRIVER)",
    example: "ADMIN"
  })
  @IsEnum(eUSER)
  role: string | eUSER.CUSTOMER;

}
