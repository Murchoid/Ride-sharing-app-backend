import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

enum eSTATUS {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

enum ePAYMENTSMETHOD {
  CASH = 'CASH',
  MPESA = 'MPESA',
  CARD = 'CARD',
}

enum ePAYMENTSTUTUS {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export class CreateBookingDto {
  @IsUUID()
  customerId: string;

  @IsString()
  pickupAddress: string;

  @IsString()
  dropoffAddress: string;

  @IsNumber()
  pickupLat: number;

  @IsNumber()
  pickupLng: number;

  @IsNumber()
  dropoffLat: number;

  @IsNumber()
  dropoffLng: number;

  @IsNumber()
  @IsOptional()
  distanceKm: number;

  @IsNumber()
  @IsOptional()
  durationMins: number;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsEnum(eSTATUS)
  stutus: string | eSTATUS.PENDING;

  @IsEnum(ePAYMENTSTUTUS)
  paymentStatus: string | ePAYMENTSTUTUS.PENDING;

  @IsEnum(ePAYMENTSMETHOD)
  paymentMethod: string | ePAYMENTSMETHOD.CASH;
}
