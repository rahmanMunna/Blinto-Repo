import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import cookieParser from "cookie-parser";

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API documentation for the URL Shortener')
    .setVersion('1.0')
    .addTag('url')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs/api/v1',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: ["http://localhost:3001"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
