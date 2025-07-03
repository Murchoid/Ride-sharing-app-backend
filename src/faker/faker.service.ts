import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { CreateVehicleDto } from '../vehicles/dto/create-vehicle.dto';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Driver } from 'src/drivers/entities/driver.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Injectable()
export class FakerService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  fakeUser(): CreateUserDto {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'CUSTOMER',
    };
  }

  fakeDriver(userId: string): CreateDriverDto {
    return {
      userId,
      isAvailable: faker.datatype.boolean(),
      baseLat: faker.location.latitude(),
      baseLng: faker.location.longitude(),
    };
  }

  fakeVehicle(driverId: string): CreateVehicleDto {
    return {
      model: faker.vehicle.model(),
      plate: faker.vehicle.vrm(),
      driverId,
    };
  }

  fakeBooking(driverId: string, customerId: string): CreateBookingDto {
    return {
      customerId,
      pickupAddress: faker.location.streetAddress(),
      dropoffAddress: faker.location.streetAddress(),
      pickupLat: faker.location.latitude(),
      pickupLng: faker.location.longitude(),
      dropoffLat: faker.location.latitude(),
      dropoffLng: faker.location.longitude(),
      distanceKm: faker.number.float({ min: 1, max: 30 }),
      durationMins: faker.number.int({ min: 5, max: 60 }),
      price: faker.number.float({ min: 100, max: 2000 }),
      stutus: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH',
    };
  }

  async clearAll() {
    // Clear in order: bookings -> vehicles -> drivers -> users
    await this.bookingRepo.deleteAll();
    await this.vehicleRepo.deleteAll();
    await this.driverRepo.deleteAll();
    await this.userRepo.deleteAll();
  }

  async seed(count = 5) {
    await this.clearAll();

    const users: User[] = [];
    const drivers: Driver[] = [];
    const vehicles: Vehicle[] = [];
    const bookings: Booking[] = [];

    // Seed users
    for (let i = 0; i < count; i++) {
      const userDto = this.fakeUser();
      const user = this.userRepo.create(userDto);
      users.push(await this.userRepo.save(user));
    }

    // Seed drivers (using first N users)
    for (let i = 0; i < count; i++) {
      const driverDto = this.fakeDriver(users[i].id);
      const driver = this.driverRepo.create({ ...driverDto, user: users[i] });
      drivers.push(await this.driverRepo.save(driver));
    }

    // Seed vehicles (using first N drivers)
    for (let i = 0; i < count; i++) {
      const vehicleDto = this.fakeVehicle(drivers[i].id);
      const vehicle = this.vehicleRepo.create({
        ...vehicleDto,
        driver: drivers[i],
      });
      vehicles.push(await this.vehicleRepo.save(vehicle));
    }

    // Seed bookings (using first N drivers and users)
    for (let i = 0; i < count; i++) {
      const bookingDto = this.fakeBooking(drivers[i].id, users[i].id);
      const booking = this.bookingRepo.create({
        ...bookingDto,
        driver: drivers[i],
        customer: users[i],
      });
      bookings.push(await this.bookingRepo.save(booking));
    }

    return { users, drivers, vehicles, bookings };
  }
}
