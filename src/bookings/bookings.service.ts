import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { In, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { User } from 'src/users/entities/user.entity';
import { DistanceService } from 'src/distance/distance.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private distanceService: DistanceService
  ){}

  async create(createBookingDto: CreateBookingDto) {
    let { customerId, pickupLng, pickupLat, dropoffLat, dropoffLng, distanceKm, price, durationMins } = createBookingDto;
    if(!customerId) throw new NotFoundException("Customer id must be provided");
    
    const drivers = await this.driverRepo.findBy({
      isAvailable: true
    });
    if(!drivers) return "No driver is available now try again later";
    const user = await this.userRepo.findBy({
      id: In([customerId])
    });
    if(!user) throw new NotFoundException('Customers not found!');


    //write function to calculate distance, duration and price
    const {durationAtoB,calculated_price, distance_Km } = await this.distanceService.calculatePriceandReturnDuraiton(
      pickupLat, pickupLng,
      dropoffLat, dropoffLng
    );
    
    distanceKm = Math.floor(distance_Km);
    durationMins = Math.floor(durationAtoB);
    price = Math.floor(calculated_price);

    //function to calculate closest driver
    const driver = await this.distanceService.findClosestDriver(
      pickupLat,pickupLng, drivers
    );


    const preparedBooking = this.bookingRepo.create({
      ...createBookingDto,
      driver: driver as Driver,
      customer: user[0],
      distanceKm,
      durationMins,
      price
    });

    const booking = await this.bookingRepo.save(preparedBooking);
    return booking;
  }

  async findAll() {
    const booking = await this.bookingRepo.find();
    return booking;
  }

  async findOne(id: number) {
    const booking = await this.bookingRepo.findOneBy({
      id: id.toString()
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
