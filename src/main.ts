import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ingridients');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ingridients',
      protoPath: join(__dirname, '../src/ingridients.proto'),
      url: `${process.env.INGRIDIENTS_SVC}:${process.env.INGRIDIENTS_GRPC_PORT}`,
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`ingridients microservice is listening...`);

  await app.listen(process.env.INGRIDIENTS_REST_PORT);

  logger.verbose(
    `ingridients service running on port: ${process.env.INGRIDIENTS_REST_PORT}`,
  );
}
bootstrap();
