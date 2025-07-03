import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Driver } from 'src/drivers/entities/driver.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
  ) {}
  async create(createVehicleDto: CreateVehicleDto) {
    const { driverId } = createVehicleDto;
    if (!driverId) throw new NotFoundException('Driver id must be provided');
    const driver = await this.driverRepo.findOneBy({
      id: driverId,
    });
    if (!driver) throw new NotFoundException('Driver not found!');

    const preparedVehicle = this.vehicleRepo.create({
      ...createVehicleDto,
      driver,
    });

    const vehicle = await this.vehicleRepo.save(preparedVehicle);
    return vehicle;
  }

  async findAll() {
    const vehicle = await this.vehicleRepo.find();
    return vehicle;
  }

  async findOne(id: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id, isRetired: false },
    });
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehicleRepo.update(id, updateVehicleDto);
    return vehicle;
  }

  async remove(id: string) {
    const vehicle = await this.vehicleRepo.findOneBy({ id });
    if (vehicle) {
      vehicle.isRetired = true;
      await this.vehicleRepo.save(vehicle);

      return vehicle.id;
    }
    throw new NotFoundException('Vehicle not found');
  }
}
