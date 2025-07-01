import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

enum eUSER{
    CUSTOMER='CUSTOMER',
    DRIVER='DRIVER',
    ADMIN='ADMIN'
}

export class CreateUserDto {
    @IsString()
    name: string;
    
    @IsEmail()
    email: string;
    
    @IsString()
    password: string;
        
    @IsEnum(eUSER)
    role: string | eUSER.CUSTOMER;
    
    @IsString()
    @IsOptional()
    accessToken: string;
    
    @IsString()
    @IsOptional()
    refreshToken: string;
}
