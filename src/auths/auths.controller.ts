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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auths')
@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @ApiOperation({ summary: 'Login', description: 'Logs in a user and returns JWT access and refresh tokens' })
  @Public()
  @Post('/signin')
  signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.signIn(createAuthDto);
  }

  @ApiOperation({ summary: 'Logout', description: 'Invalidates the user’s refresh token and logs them out' })
  @Public()
  @Post('/signout/:id')
  signOut(@Param('id') id: string) {
    return this.authsService.signOut(id);
  }

  @ApiOperation({ summary: 'Refresh token', description: 'Issues new access and refresh tokens using a valid refresh token' })
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
