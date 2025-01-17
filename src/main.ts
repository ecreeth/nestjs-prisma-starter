import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
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

  /*
   * Set a prefix for every route registered
   * URL: https://docs.nestjs.com/faq/global-prefix
   */
  app.setGlobalPrefix('v1/api', {
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
   * Prisma client exception filter for unhandled exceptions
   * URL: https://nestjs-prisma.dev/docs/exception-filter
   */
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
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

  /*
   * Cross-origin resource sharing (CORS)
   * URL: https://docs.nestjs.com/security/cors#getting-started
   */
  if (corsConfig.enabled) {
    app.enableCors({ origin: true, credentials: true });
  }

  await app.listen(process.env.PORT || nestConfig.port || 3000);
}
bootstrap();
