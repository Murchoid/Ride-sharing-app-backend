import { IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreateDriverDto {
  @IsUUID()
  userId: string;

  @IsBoolean()
  isAvailable: boolean;

  @IsNumber()
  baseLat: number;

  @IsNumber()
  baseLng: number;
}
