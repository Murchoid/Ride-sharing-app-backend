import { Module } from '@nestjs/common';
import { FakerService } from './faker.service';
import { FakerController } from './faker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { User } from 'src/users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Vehicle, User, Booking, Driver])],
  controllers: [FakerController],
  providers: [FakerService],
})
export class FakerModule {}
