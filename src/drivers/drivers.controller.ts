import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { eROLE } from 'src/common/types/roles.types';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { RequestWithUser } from 'src/common/types/request.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @ApiOperation({ summary: 'Create driver', description: 'Registers a new driver (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @ApiOperation({ summary: 'Get all drivers', description: 'Fetches details of all drivers (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @ApiOperation({ summary: 'Get driver by ID', description: 'Fetches details of a specific driver (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @ApiOperation({ summary: 'Get own driver profile', description: 'Driver fetches their own driver profile' })
  @ROLES(eROLE.DRIVER)
  @Get('/me')
  findOwn(@Req() req: RequestWithUser) {
    const { sub } = req.user;
    return this.driversService.findOne(sub);
  }

  @ApiOperation({ summary: 'Update driver', description: 'Modifies driver info (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @ApiOperation({ summary: 'Delete driver', description: 'Soft deletes a driver (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
