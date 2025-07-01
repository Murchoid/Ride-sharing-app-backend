import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow<string>('POSTGRE_HOST'),
      port: this.configService.getOrThrow<number>('POSTGRE_PORT'),
      username: this.configService.getOrThrow<string>('POSTGRE_USER'),
      password: this.configService.getOrThrow<string>('POSTGRE_PASS'),
      database: this.configService.getOrThrow<string>('POSTGRE_DB'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }
}
