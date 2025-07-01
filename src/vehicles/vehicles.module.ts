import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Vehicle, Driver])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
