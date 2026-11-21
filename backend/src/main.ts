import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve static uploaded files (JPEG, PNG images for questions)
  const uploadsPath = join(process.cwd(), '..', 'uploads');
  const localUploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });
  app.useStaticAssets(localUploadsPath, { prefix: '/uploads' });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('ProTest Educational Mathematical Testing API')
    .setDescription('REST API для математической образовательной платформы ProTest')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`=======================================================`);
  console.log(`  ProTest Backend successfully running on port ${port}`);
  console.log(`  Swagger API Docs: http://localhost:${port}/api/docs`);
  console.log(`=======================================================`);
}

bootstrap();
