import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from './decorators/public.decorator';
import { RequestWithUser } from 'src/common/types/request.interface';

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

  @Public()
  @Post('/refresh-token')
  refreshtoken(@Query() id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    if (user.sub != id) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authsService.refreshTokens(id, user.refreshToken);
  }
}
