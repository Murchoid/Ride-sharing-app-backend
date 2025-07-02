import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}

export class UpdateBookingStatusDto {
  @IsEnum(['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'])
  status: string;
}

export class UpdateBookingPaymentMethodDto {
  @IsEnum(['CASH', 'MPESA', 'CARD'])
  paymentMethod: string;
}

export class UpdateBookingPaymentStatusDto {
  @IsEnum(['PENDING', 'PAID'])
  paymentStatus: string;
}

export class UpdateBookingPickUpAndDropOffLocationDto {
  @IsNumber()
  @IsOptional()
  pickupLat: number;

  @IsNumber()
  @IsOptional()
  pickupLng: number;

  @IsNumber()
  @IsOptional()
  dropoffLat: number;

  @IsNumber()
  @IsOptional()
  dropoffLng: number;
}
