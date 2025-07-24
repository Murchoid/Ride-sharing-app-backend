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
import { eROLE } from 'src/common/types/roles.types';
import { RequestWithUser } from 'src/common/types/request.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Refresh token', description: 'Issues new access and refresh tokens using a valid refresh token' })
  @Public()
  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users', description: 'get all users (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

   @ApiOperation({ summary: 'Get own profile', description: 'Returns authenticated user profile data' })
  @ROLES(eROLE.CUSTOMER, eROLE.DRIVER, eROLE.ADMIN)
  @Get('/me')
  findOwn(@Req() req: RequestWithUser) {
    const { sub } = req.user;
    return this.usersService.findOne(sub);
  }

  @ApiOperation({ summary: 'Get specific user', description: 'Returns any authenticated user profile data (Admin only)' })
  @ROLES(eROLE.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }


  @ApiOperation({ summary: 'Update user', description: 'Updates user info by ID (self or admin)' })
  @ROLES(eROLE.CUSTOMER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  @ApiOperation({ summary: 'Deletes user', description: 'Soft deletes a user (admin only)' })
  @ROLES(eROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
