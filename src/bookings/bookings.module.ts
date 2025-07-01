import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { DistanceService } from 'src/distance/distance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Driver])],
  controllers: [BookingsController],
  providers: [BookingsService, DistanceService],
})
export class BookingsModule {}
