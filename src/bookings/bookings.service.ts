import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { In, Repository } from 'typeorm';
import { BookingsModule } from './bookings.module';
import { Booking } from './entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { DriversModule } from 'src/drivers/drivers.module';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<BookingsModule>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<DriversModule>,
    @InjectRepository(User)
    private readonly userRepo: Repository<UsersModule>
  ){}

  async create(createBookingDto: CreateBookingDto) {
    const { driverId, customerId } = createBookingDto;
    if(!driverId) throw new NotFoundException("Driver id must be provided!");
    if(!customerId) throw new NotFoundException("Customer id must be provided");
    const driver = await this.driverRepo.findBy({
      id: In([driverId])
    });
    if(!driver) throw new NotFoundException('Drivers not found!');
    const customer = await this.userRepo.findBy({
      id: In([customerId])
    });
    if(!customer) throw new NotFoundException('Customers not found!');

    const preparedBooking = this.bookingRepo.create({
      ...createBookingDto,
      customer,
      driver
    })

    const booking = await this.bookingRepo.save(createBookingDto);
  }

  async findAll() {
    const booking = await this.bookingRepo.find();
    return booking;
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOneBy({
      where:{id}
    });
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingRepo.update(id, updateBookingDto);
    return booking;
  }

  async remove(id: number) {
    const booking = await this.bookingRepo.delete(id)
  }
}
