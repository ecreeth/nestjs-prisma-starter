import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from './app.module';

const MAX_REQUEST_BODY_SIZE = '50mb';

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
   * Helmet can help protect your app from some well-known
   * web vulnerabilities by setting HTTP headers appropriately.
   * URL: https://docs.nestjs.com/security/helmet
   */
  app.use(helmet());

  /*
   * It parses incoming requests with JSON payloads
   * URL: https://expressjs.com/en/api.html#express.json
   */
  app.use(json({ limit: MAX_REQUEST_BODY_SIZE }));

  /*
   * It parses incoming requests with urlencoded payloads
   * URL: https://expressjs.com/en/api.html#express.urlencoded
   */
  app.use(urlencoded({ extended: true, limit: MAX_REQUEST_BODY_SIZE }));

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

  /*
   * Swagger API
   * URL: https://docs.nestjs.com/openapi/introduction
   */
  const options = new DocumentBuilder()
    .setTitle('Fresh')
    .setVersion('1.0')
    .setDescription('The Fresh Server API description')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
