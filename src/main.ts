import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { PrismaClientExceptionFilter, PrismaService } from 'nestjs-prisma';
import type {
  CorsConfig,
  NestConfig,
  SwaggerConfig,
} from 'src/common/configs/config.interface';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // abortOnError: false,
  });

  // Set a prefix for every route registered
  // https://docs.nestjs.com/faq/global-prefix
  app.setGlobalPrefix('v1/api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // It parses incoming requests with JSON payloads
  // https://expressjs.com/en/api.html#express.json
  app.use(json({ limit: '50mb' }));

  // It parses incoming requests with urlencoded payloads
  // https://expressjs.com/en/api.html#express.urlencoded
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Use the built-in validation
  // https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe
  app.useGlobalPipes(new ValidationPipe());

  // Enable shutdown hook
  // https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks
  const prismaService: PrismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Prisma client exception filter for unhandled exceptions
  // https://nestjs-prisma.dev/docs/exception-filter
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  // Swagger API
  // https://docs.nestjs.com/openapi/introduction
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Nestjs')
      .setDescription(swaggerConfig.description || 'The nestjs API description')
      .setVersion(swaggerConfig.version || '1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document);
  }

  // Cross-origin resource sharing (CORS)
  // https://docs.nestjs.com/security/cors#getting-started
  if (corsConfig.enabled) {
    app.enableCors({ origin: true, credentials: true });
  }

  await app.listen(process.env.PORT || nestConfig.port || 3000);
}
bootstrap();
