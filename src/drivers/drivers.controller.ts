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
import { eROLE } from 'common/types/roles.types';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { RequestWithUser } from 'common/types/request.interface';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @ROLES(eROLE.ADMIN)
  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @ROLES(eROLE.ADMIN)
  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @ROLES(eROLE.DRIVER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @ROLES(eROLE.DRIVER)
  @Get('/me')
  findOwn(@Req() req: RequestWithUser) {
    const {sub} = req.user;
    return this.driversService.findOne(sub);
  }

  @ROLES(eROLE.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @ROLES(eROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
