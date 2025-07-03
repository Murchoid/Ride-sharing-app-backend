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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/auths/decorators/public.decorator';
import { ROLES } from 'src/auths/decorators/roles.decorator';
import { eROLE } from 'common/types/roles.types';
import { RequestWithUser } from 'common/types/request.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ROLES(eROLE.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ROLES(eROLE.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ROLES(eROLE.CUSTOMER)
    @Get('/me')
    findOwn(@Req() req: RequestWithUser) {
      const {sub} = req.user;
      return this.usersService.findOne(sub);
    }

  @ROLES(eROLE.CUSTOMER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ROLES(eROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
