import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { BookingsModule } from './bookings/bookings.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ConfigsModule } from './configs/configs.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { FakerModule } from './faker/faker.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthsModule } from './auths/auths.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AtGuard } from './auths/guards/at.guards';
import { RolesGuard } from './auths/guards/roles.guards';

@Module({
  imports: [
    UsersModule,
    DriversModule,
    BookingsModule,
    VehiclesModule,
    ConfigsModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        ttl: configService.getOrThrow<number>('T_TTL'),
        stores: [createKeyv(configService.getOrThrow<string>('REDIS_URL'))],
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('T_TTL'),
          limit: configService.getOrThrow<number>('T_LIMIT'),
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FakerModule,
    AnalyticsModule,
    AuthsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
