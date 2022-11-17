import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ingridients');

  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  // {
  //   transport: Transport.GRPC,
  //   options: {
  //     package: 'ingridients',
  //     protoPath: join(__dirname, '../src/ingridients.proto'),
  //     url: 'localhost:3008',
  //   },
  // },
  // );

  // await app.listen();

  // logger.verbose(`ingridients microservice is listening...`);

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ingridients',
      protoPath: join(__dirname, '../src/ingridients.proto'),
      url: 'localhost:3008',
    },
  });

  await app.startAllMicroservices();

  logger.verbose(`ingridients microservice grpc is listening...`);

  await app.listen(3010);

  logger.verbose(`ingridients microservice is listening on port: ${3010}`);
}
bootstrap();
