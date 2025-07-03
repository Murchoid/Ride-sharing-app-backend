import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateVehicleDto {
   @ApiProperty({
      description: "Model of teh car",
      example: "Vitz"
    })
  @IsString()
  model: string;

   @ApiProperty({
      description: "Car number plate",
      example: "KDK 1234"
    })
  @IsString()
  plate: string;

   @ApiProperty({
      description: "Driver id",
      example: "valid id no example here lol"
    })
  @IsUUID()
  driverId: string;
}
