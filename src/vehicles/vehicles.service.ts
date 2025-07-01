import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehiclesModule } from './vehicles.module';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Driver } from 'src/drivers/entities/driver.entity';
import { DriversModule } from 'src/drivers/drivers.module';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<VehiclesModule>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<DriversModule>
  ){}
  async create(createVehicleDto: CreateVehicleDto) {
    const {driverId} = createVehicleDto;
    if(!driverId) throw new NotFoundException('Driver id must be provided');
    const driver = await this.driverRepo.findOneBy({
      where:{id:driverId}
    });
    if(!driver) throw new NotFoundException('Driver not found!');

    const preparedVehicle = this.vehicleRepo.create({
      ...createVehicleDto,
      driver
    })

    const vehicle = await this.vehicleRepo.save(preparedVehicle);
    return vehicle;
  }

  async findAll() {
    const vehicle = await this.vehicleRepo.find();
    return vehicle;
  }

  async findOne(id: number) {
    const vehicle = await this.vehicleRepo.findOneBy({
      where:{id}
    });
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehicleRepo.update(id, updateVehicleDto);
    return vehicle;
  }

  async remove(id: number) {
    const vehicle = await this.vehicleRepo.delete(id);
    return vehicle;
  }
}
