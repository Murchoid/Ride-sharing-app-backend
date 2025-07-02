import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  UpdateBookingDto,
  UpdateBookingPaymentMethodDto,
  UpdateBookingPaymentStatusDto,
  UpdateBookingPickUpAndDropOffLocationDto,
  UpdateBookingStatusDto,
} from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateBookingStatus(
    @Param('id') id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(id, body.status);
  }

  @Patch(':id/payment-method')
  updateBookingPaymentMethod(
    @Param('id') id: string,
    @Body() body: UpdateBookingPaymentMethodDto,
  ) {
    return this.bookingsService.updateBookingPaymentMethod(id, body.paymentMethod);
  }

  @Patch(':id/locations')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocations: UpdateBookingPickUpAndDropOffLocationDto,
  ) {
    return this.bookingsService.updateLocations(id, updateLocations);
  }

  @Patch(':id/pay-ride')
  updatePayment(
    @Param('id') id: string,
    @Body() body: UpdateBookingPaymentStatusDto,
  ) {
    return this.bookingsService.updateBookingPaymentStatus(id, body.paymentStatus);
  }

}
