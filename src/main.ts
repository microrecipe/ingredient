import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ingridients',
      protoPath: join(__dirname, '../src/ingridients.proto'),
      url: `0.0.0.0:${process.env.INGRIDIENT_GRPC_PORT}`,
    },
  });

  await app.startAllMicroservices();

  logger.log(
    `gRPC service running on port: ${process.env.INGRIDIENT_GRPC_PORT}`,
  );

  await app.listen(process.env.INGRIDIENT_REST_PORT);

  logger.log(
    `HTTP service running on port: ${process.env.INGRIDIENT_REST_PORT}`,
  );
}
bootstrap();
