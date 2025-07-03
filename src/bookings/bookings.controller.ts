import { Controller, Get, Post, Body, Patch, Param, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  UpdateBookingDto,
  UpdateBookingPaymentMethodDto,
  UpdateBookingPaymentStatusDto,
  UpdateBookingPickUpAndDropOffLocationDto,
  UpdateBookingStatusDto,
} from './dto/update-booking.dto';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { eROLE } from 'common/types/roles.types';
import { RequestWithUser } from 'common/types/request.interface';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ROLES(eROLE.CUSTOMER)
  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @ROLES(eROLE.ADMIN)
  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @ROLES(eROLE.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @ROLES(eROLE.CUSTOMER)
  @Get('/me')
  findOwn(@Req() req: RequestWithUser) {
    const { sub } = req.user;
    return this.bookingsService.findOne(sub);
  }

  @ROLES(eROLE.DRIVER, eROLE.ADMIN)
  @Patch(':id/status')
  updateBookingStatus(
    @Param('id') id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(id, body.status);
  }

  @ROLES(eROLE.CUSTOMER)
  @Patch(':id/payment-method')
  updateBookingPaymentMethod(
    @Param('id') id: string,
    @Body() body: UpdateBookingPaymentMethodDto,
  ) {
    return this.bookingsService.updateBookingPaymentMethod(
      id,
      body.paymentMethod,
    );
  }

  @ROLES(eROLE.CUSTOMER)
  @Patch(':id/locations')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocations: UpdateBookingPickUpAndDropOffLocationDto,
  ) {
    return this.bookingsService.updateLocations(id, updateLocations);
  }

  @ROLES(eROLE.CUSTOMER)
  @Patch(':id/pay-ride')
  updatePayment(
    @Param('id') id: string,
    @Body() body: UpdateBookingPaymentStatusDto,
  ) {
    return this.bookingsService.updateBookingPaymentStatus(
      id,
      body.paymentStatus,
    );
  }
}
