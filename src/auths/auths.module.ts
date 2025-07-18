import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AtStrategy } from './strategies/at.strategy';
import { RfStrategy } from './strategies/rt.strategy';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
    }),
    PassportModule,
  ],
  controllers: [AuthsController],
  providers: [AuthsService, AtStrategy, RfStrategy],
})
export class AuthsModule {}
