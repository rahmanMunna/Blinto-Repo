import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

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
        username: configService.get<string>('PG_USER_NAME', 'postgres'),
        password: configService.get<string>('PG_PASSWORD'),
        database: configService.get<string>('PG_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      })
    }),

    AuthModule,

    UserModule
  ],
  controllers: [],
  providers: [UserModule],
})
export class AppModule { }
