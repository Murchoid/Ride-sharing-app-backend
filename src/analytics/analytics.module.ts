import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { User } from 'src/users/entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, User, Booking])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
