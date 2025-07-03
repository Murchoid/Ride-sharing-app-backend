import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from './decorators/public.decorator';
import { RequestWithUser } from 'common/types/request.interface';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Public()
  @Post('/signin')
  signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.signIn(createAuthDto);
  }

  @Public()
  @Post('/signout/:id')
  signOut(@Param('id') id: string) {
    return this.authsService.signOut(id);
  }

  @Post('/refresh-token')
  refreshtoken(@Query() id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    if (user.sub != id) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authsService.refreshTokens(id, user.refreshToken);
  }
}
