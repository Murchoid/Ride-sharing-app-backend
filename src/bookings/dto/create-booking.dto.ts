import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

enum eSTATUS {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

enum ePAYMENTSMETHOD {
  CASH = 'CASH',
  MPESA = 'MPESA',
  CARD = 'CARD',
}

enum ePAYMENTSTUTUS {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export class CreateBookingDto {
  @ApiProperty({
    description: "Customer's valid id",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: "Customer's current address",
    example: "Ruiru"
  })
  @IsString()
  pickupAddress: string;

  @ApiProperty({
    description: "Customer's destination",
    example: "Thika"
  })
  @IsString()
  dropoffAddress: string;

  @ApiProperty({
    description: "Customer's current latitude coordinate",
    example: -0.7
  })
  @IsNumber()
  pickupLat: number;

  @ApiProperty({
    description: "Customer's current longitude coordinate",
    example: 37.11667
  })
  @IsNumber()
  pickupLng: number;

  @ApiProperty({
    description: "Customer's destination latitude coordinate",
    example: -1.03326
  })
  @IsNumber()
  dropoffLat: number;

  @ApiProperty({
    description: "Customer's destination longitude coordinate",
    example: 37.06933
  })
  @IsNumber()
  dropoffLng: number;
  
  @ApiProperty({
    description: "Distance of the journey in kilometers",
    example: 15.5,
    required: false
  })
  @IsNumber()
  @IsOptional()
  distanceKm: number;

  @ApiProperty({
    description: "Approximate duration of the journey in minutes",
    example: 35,
    required: false
  })
  @IsNumber()
  @IsOptional()
  durationMins: number;

  @ApiProperty({
    description: "Cost of the journey in local currency",
    example: 1200,
    required: false
  })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({
    description: "Status of the booking, default is PENDING",
    enum: eSTATUS,
    example: eSTATUS.PENDING
  })
  @IsEnum(eSTATUS)
  stutus: string | eSTATUS.PENDING;

  @ApiProperty({
    description: "Payment status of the booking, default is PENDING",
    enum: ePAYMENTSTUTUS,
    example: ePAYMENTSTUTUS.PENDING
  })
  @IsEnum(ePAYMENTSTUTUS)
  paymentStatus: string | ePAYMENTSTUTUS.PENDING;

  @ApiProperty({
    description: "Payment method for the booking",
    enum: ePAYMENTSMETHOD,
    example: ePAYMENTSMETHOD.CASH
  })
  @IsEnum(ePAYMENTSMETHOD)
  paymentMethod: string | ePAYMENTSMETHOD.CASH;
}
