import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: true, // O más estricto: ['https://tu-frontend-production.railway.app']
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Mini Sivesoft API')
    .setDescription('API para gestión de inventario multi-tenant')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Escuchar explícitamente en IPv4
  await app.listen(3000, '0.0.0.0'); // 👈 Esto está correcto
  
  console.log(`🚀 Application is running on: http://localhost:3000`);
  console.log(`📚 Swagger docs: http://localhost:3000/api/docs`);
}
bootstrap();
