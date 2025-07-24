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
import { eROLE } from 'src/common/types/roles.types';
import { RequestWithUser } from 'src/common/types/request.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @ApiOperation({ summary: 'Create booking', description: 'Creates a ride booking and auto-assigns a driver (admin customer)' })
  @ROLES(eROLE.CUSTOMER, eROLE.ADMIN)
  @Post('create')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @ApiOperation({ summary: 'Get user bookings', description: 'Gets all bookings for the authenticated user (admin only)' })
  @ROLES(eROLE.ADMIN, eROLE.DRIVER)
  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }
  @ApiOperation({ summary: 'Get user own booking details', description: 'Get own bookings' })
  @ROLES(eROLE.CUSTOMER)
  @Get('/me')
  findOwn(@Req() req: RequestWithUser) {
    const { sub } = req.user;
    return this.bookingsService.findOneBy(sub);
  }
  
  @ApiOperation({ summary: 'Get user booking using id', description: 'Gets specific user bookings for the authenticated user (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update booking status', description: 'Changes status (ACCEPTED, COMPLETED, CANCELLED) (admin,driver only)' })
  @ROLES(eROLE.DRIVER, eROLE.ADMIN, eROLE.CUSTOMER)
  @Patch(':id/status')
  updateBookingStatus(
    @Param('id') id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(id, body.status);
  }

  @ApiOperation({ summary: 'Update booking payment method', description: 'Modifies payment method (PAID)' })
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

  @ApiOperation({ summary: 'Update booking locations', description: 'Modifies pickup/dropoff and recalculates price' })
  @ROLES(eROLE.CUSTOMER)
  @Patch(':id/locations')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocations: UpdateBookingPickUpAndDropOffLocationDto,
  ) {
    return this.bookingsService.updateLocations(id, updateLocations);
  }

  @ApiOperation({ summary: 'User booking status', description: 'user request change booking status (COMPLETE, CANCEL)' })
  @ROLES(eROLE.CUSTOMER)
  @Patch(':id/payment-status')
  updatePayment(
    @Param('id') id: string,
    @Body() body: UpdateBookingPaymentStatusDto,
  ) {
    return this.bookingsService.updateBookingPaymentStatus(
      id,
      body.paymentStatus,
    );
  }

  @ApiOperation({ summary: 'Update booking details', description: 'Updates booking details (admin only)' })
  @ROLES(eROLE.ADMIN, eROLE.CUSTOMER, eROLE.DRIVER)
  @Patch(':id/update')
  updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(id, updateBookingDto);
  }
}