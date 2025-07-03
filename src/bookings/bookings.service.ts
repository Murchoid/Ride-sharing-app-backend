import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  UpdateBookingDto,
  UpdateBookingPaymentMethodDto,
  UpdateBookingPaymentStatusDto,
  UpdateBookingPickUpAndDropOffLocationDto,
  UpdateBookingStatusDto,
} from './dto/update-booking.dto';
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
    private distanceService: DistanceService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    let {
      customerId,
      pickupLng,
      pickupLat,
      dropoffLat,
      dropoffLng,
      distanceKm,
      price,
      durationMins,
    } = createBookingDto;
    if (!customerId)
      throw new NotFoundException('Customer id must be provided');

    const drivers = await this.driverRepo.findBy({
      isAvailable: true,
      isActive: true,
    });
    console.log(drivers);
    if (drivers.length == 0) throw new NotFoundException('No driver is available now try again later');
    const user = await this.userRepo.findBy({
      id: In([customerId]),
    });
    if (!user) throw new NotFoundException('Customers not found!');

    // function to calculate distance, duration and price
    const { durationAtoB, calculated_price, distance_Km } =
      await this.distanceService.calculatePriceandReturnDuraiton(
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
      );

    distanceKm = Math.round(distance_Km);
    durationMins = Math.floor(durationAtoB);
    price = Math.floor(calculated_price);

    //function to calculate closest driver
    const driver = await this.distanceService.findClosestDriver(
      pickupLat,
      pickupLng,
      drivers,
    );

    const preparedBooking = this.bookingRepo.create({
      ...createBookingDto,
      driver: driver as Driver,
      customer: user[0],
      distanceKm,
      durationMins,
      price,
    });

    const booking = await this.bookingRepo.save(preparedBooking);
    await this.driverRepo.update(driver!.id, { isAvailable: false });
    return booking;
  }

  async findAll() {
    const booking = await this.bookingRepo.find();
    return booking;
  }

  async findOne(id: string) {
    const booking = await this.bookingRepo.findOneBy({
      id,
    });
    return booking;
  }

  async updateBookingStatus(
    id: string,
    status: UpdateBookingStatusDto['status'],
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['driver'],
    });

    if (!booking) throw new NotFoundException('Booking not found!');

    if (status == 'COMPLETED' || status == 'CANCELLED') {
      if (status == 'COMPLETED') {
        //logic to obvio change driver's base loc after dropping baddie
        booking.driver.baseLat = booking.dropoffLat;
        booking.driver.baseLng = booking.dropoffLng;
        booking.driver.isAvailable = true;
        if(booking.paymentMethod == 'CASH'){
          booking.paymentStatus='PAID';
        }
        await this.driverRepo.update(booking.driver.id, booking.driver);
      } else {
        booking.driver.isAvailable = true;
        await this.driverRepo.update(booking.driver.id, booking.driver);
      }
    }

    booking.status = status;

    return await this.bookingRepo.save(booking);
  }

  async updateBookingPaymentStatus(
    id: string,
    paymentSatus: UpdateBookingPaymentStatusDto['paymentStatus'],
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['driver'],
    });

    if (!booking) throw new NotFoundException('Booking not found!');

    //Only update payment status if its pending
    if(booking.paymentStatus == 'PENDING')
    booking.paymentStatus = paymentSatus;

    return await this.bookingRepo.save(booking);
  }

  async updateBookingPaymentMethod(
    id: string,
    paymentMethod: UpdateBookingPaymentMethodDto['paymentMethod'],
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
    });

    if (!booking) throw new NotFoundException('Booking not found!');

    booking.paymentMethod = paymentMethod;
    return await this.bookingRepo.save(booking);
  }

  async updateLocations(
    id: string,
    updateLocations: UpdateBookingPickUpAndDropOffLocationDto,
  ) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['driver'],
    });

    if (!booking) throw new NotFoundException('Booking not found!');

    const updatedBooking = Object.assign(booking, updateLocations);

    const locs = ['pickupLat', 'pickupLng', 'dropoffLat', 'dropoffLng'];
    const changed = locs.some((key) => key in updateLocations);

    if (changed) {
      const { pickupLat, pickupLng, dropoffLat, dropoffLng } = updatedBooking;
      const { durationAtoB, calculated_price, distance_Km } =
        await this.distanceService.calculatePriceandReturnDuraiton(
          pickupLat,
          pickupLng,
          dropoffLat,
          dropoffLng,
        );

      updatedBooking.distanceKm = Number(distance_Km.toFixed(3));
      updatedBooking.durationMins = Number(durationAtoB.toFixed(2));
      updatedBooking.price = Number(calculated_price.toFixed(2));

      const drivers = await this.driverRepo.findBy({
        isAvailable: true,
        isActive: true,
      });
      if (!drivers) return 'No driver is available now, try again later';

      //function to calculate closest driver
      const driver = await this.distanceService.findClosestDriver(
        pickupLat,
        pickupLng,
        drivers,
      );

      const preparedBooking = this.bookingRepo.create({
        ...updatedBooking,
        driver: driver as Driver,
        distanceKm: updatedBooking['distanceKm'],
        durationMins: updatedBooking['durationMins'],
        price: updatedBooking['price'],
      });

      const finalBooking = await this.bookingRepo.save(preparedBooking);
      await this.driverRepo.update(driver!.id, { isAvailable: false });
      return finalBooking;
    }

    return await this.bookingRepo.save(booking);
  }
}
