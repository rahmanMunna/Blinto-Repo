import { Module } from '@nestjs/common';
import { UrlModule } from './url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UrlModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: process.env.PG_HOST,
      host: 'localhost',
      // port: parseInt(process.env.PG_PORT ?? '5432', 10),
      port: 5432,
      username: 'postgres',
      // password: process.env.PG_PASSWORD,
      password: '5850',
      database: 'Blinto',
      autoLoadEntities: true,
      synchronize: true,
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
