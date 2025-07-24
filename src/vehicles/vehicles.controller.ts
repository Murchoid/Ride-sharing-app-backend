import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { eROLE } from 'src/common/types/roles.types';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auths/decorators/public.decorator';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @ApiOperation({ summary: 'Register vehicle', description: 'Adds a vehicle and assigns it to a driver (admin)' })
  @ROLES(eROLE.ADMIN)
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @ApiOperation({ summary: 'Get all vehicles', description: 'Fetches all vehicle details (admin only)' })
  @Public()
  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @ApiOperation({ summary: 'Get vehicle by ID', description: 'Fetches vehicle details (admin only)' })
  @ROLES(eROLE.CUSTOMER, eROLE.DRIVER)
  @Get('/driver/:id')
  findDriverVehicle(@Param('id') id: string) {
    return this.vehiclesService.findDriverCar(id);
  }


  @ApiOperation({ summary: 'Get vehicle by ID', description: 'Fetches vehicle details (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update vehicle', description: 'Edits vehicle details (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @ApiOperation({ summary: 'Delete vehicle', description: 'Deletes or retires a vehicle (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
