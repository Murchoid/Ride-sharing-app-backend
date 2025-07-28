import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'Status of the booking',
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'],
    example: 'PENDING',
  })
  @IsEnum(['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'])
  status: string;
}

export class UpdateBookingPaymentMethodDto {
  @ApiProperty({
    description: 'Payment method for the booking',
    enum: ['CASH', 'MPESA', 'CARD'],
    example: 'CASH',
  })
  @IsEnum(['CASH', 'MPESA', 'CARD'])
  paymentMethod: string;
}

export class UpdateBookingPaymentStatusDto {
  @ApiProperty({
    description: 'Payment status of the booking',
    enum: ['PENDING','PROCESSING','SUCCESS','FAILED'],
    example: 'PENDING',
  })
  @IsEnum(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'])
  paymentStatus: string;
}

export class UpdateBookingPickUpAndDropOffLocationDto {
  @ApiProperty({
    description: "Customer's current latitude coordinate",
    example: -0.7,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  pickupLat: number;

  @ApiProperty({
    description: "Customer's current longitude coordinate",
    example: 37.11667,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  pickupLng: number;

  @ApiProperty({
    description: "Customer's destination latitude coordinate",
    example: -1.03326,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  dropoffLat: number;

  @ApiProperty({
    description: "Customer's destination longitude coordinate",
    example: 37.06933,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  dropoffLng: number;
}
