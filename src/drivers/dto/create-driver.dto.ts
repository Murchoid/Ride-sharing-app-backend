import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreateDriverDto {
   @ApiProperty({
      description: "User asigned id , can be null",
      example: null
    })
  @IsUUID()
  userId: string;

   @ApiProperty({
      description: "drivers availabilty",
      example: true
    })
  @IsBoolean()
  isAvailable: boolean;

   @ApiProperty({
      description: "Driver's current latitude cood",
      example: -1.28333
    })
  @IsNumber()
  baseLat: number;

  @ApiProperty({
      description: "Driver's current longitude cood",
      example:36.81667 
    })
  @IsNumber()
  baseLng: number;
}
