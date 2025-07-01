import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { BookingsModule } from './bookings/bookings.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DistanceModule } from './distance/distance.module';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { FakerModule } from './faker/faker.module';

@Module({
  imports: [
    UsersModule,
    DriversModule,
    BookingsModule,
    VehiclesModule,
    DistanceModule,
    ConfigsModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          ttl: configService.getOrThrow<number>('T_TTL'),
          stores: [createKeyv(configService.getOrThrow<string>('REDIS_URL'))],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FakerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
