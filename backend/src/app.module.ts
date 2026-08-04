import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [UrlModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PG_HOST', 'localhost'),
        port: parseInt(configService.get<string>('PG_PORT', '5432'), 10),
        username: configService.get<string>('PG_USERNAME', 'postgres'),
        password: configService.get<string>('PG_PASSWORD'),
        database: configService.get<string>('PG_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      })
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
