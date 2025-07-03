import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
  ) {}
  async getCustomerAnalytics(id: string) {
    const bookings = await this.bookingRepo.find({
      where: { customer: { id } },
      relations: ['customer'],
    });

    if (!bookings) throw new NotFoundException('No info found on this user');
    const totalMoneySpent = bookings.reduce(
      (sum, b) => sum + (b.paymentStatus == 'PAID' ? b.price : 0),
      0,
    );

    return {
      totalExpenditure: totalMoneySpent,
      totalRides: bookings.length,
    };
  }

  async getDriverAnalytics(id: string) {
    const bookings = await this.bookingRepo.find({
      where: { driver: { id }, status: 'COMPLETED' },
    });

    if (!bookings) throw new NotFoundException('No info found on this driver');
    const totalEarnings = bookings.reduce(
      (sum, b) => (b.paymentStatus == 'PAID' ? b.price : 0),
      0,
    );
    const averageDistance = bookings.length
      ? bookings.reduce((sum, b) => sum + b.distanceKm, 0) / bookings.length
      : 0;

    return {
      totalEarnings,
      totalRids: bookings.length,
      averageDistance,
    };
  }

  async getAdminAnalytics() {
    const [totalUsers, totalDrivers, totalBookings] = await Promise.all([
      this.userRepo.count(),
      this.driverRepo.count(),
      this.bookingRepo.count(),
    ]);

    const totalRevenue = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.price)', 'total')
      .where('booking.paymentStatus = :status', { status: 'PAID' })
      .getRawOne();

    const activeBookings = await this.bookingRepo.count({
      where: { status: 'PENDING' },
    });

    return {
      totalUsers,
      totalDrivers,
      totalBookings,
      totalRevenue: Number(totalRevenue.total) || 0,
      activeBookings,
    };
  }
}
