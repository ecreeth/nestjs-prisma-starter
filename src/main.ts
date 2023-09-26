import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import type {
  NestConfig,
  SwaggerConfig,
} from 'src/common/configs/config.interface';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // abortOnError: false,
  });

  /*
   * Set a prefix for every route registered
   * URL: https://docs.nestjs.com/faq/global-prefix
   */
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  /*
   * It parses incoming requests with JSON payloads
   * URL: https://expressjs.com/en/api.html#express.json
   */
  app.use(json({ limit: '50mb' }));

  /*
   * It parses incoming requests with urlencoded payloads
   * URL: https://expressjs.com/en/api.html#express.urlencoded
   */
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  /*
   * Use the built-in validation
   * URL: https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe
   */
  app.useGlobalPipes(new ValidationPipe());

  /*
   * Cross-origin resource sharing (CORS)
   * URL: https://docs.nestjs.com/security/cors#getting-started
   */
  app.enableCors({ origin: true, credentials: true });

  /*
   * Cookies
   * URL: https://docs.nestjs.com/techniques/cookies
   */
  app.use(cookieParser());

  /*
   * Prisma client exception filter for unhandled exceptions
   * URL: https://nestjs-prisma.dev/docs/exception-filter
   */
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');

  /*
   * Swagger API
   * URL: https://docs.nestjs.com/openapi/introduction
   */
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Nestjs')
      .setDescription(swaggerConfig.description || 'The nestjs API description')
      .setVersion(swaggerConfig.version || '1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document);
  }

  await app.listen(process.env.PORT || nestConfig.port || 3000);
}
bootstrap();
