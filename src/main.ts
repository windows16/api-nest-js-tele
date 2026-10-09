import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins });

  const isProd = process.env.NODE_ENV === 'production';

  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de gestión y auditoría')
    .setDescription(
      'API para autenticación, usuarios, roles, consulta de registros de auditoría.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de acceso de Supabase',
      },
      'supabase-jwt',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    jsonDocumentUrl: 'api/docs/openapi.json',
    customSiteTitle: 'Documentación de la API de gestión y auditoría',
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`API escuchando en el puerto ${port} (prefijo /api)`);
  if (!isProd) logger.log(`Swagger: http://localhost:${port}/api/docs`);
}
await bootstrap();