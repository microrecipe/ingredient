import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, KafkaOptions, TcpOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'ingredients',
      protoPath: join(__dirname, '../src/ingredients.proto'),
      url: `0.0.0.0:${process.env.INGREDIENT_GRPC_PORT}`,
    },
  });

  app.connectMicroservice<TcpOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.INGREDIENT_TCP_PORT),
    },
  });

  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'microrecipe',
        brokers: process.env.KAFKA_BROKERS.split(','),
      },
      consumer: {
        groupId: 'ingredient',
      },
    },
  });

  await app.startAllMicroservices();

  logger.log(
    `gRPC service running on port: ${process.env.INGREDIENT_GRPC_PORT}`,
  );

  logger.log(`TCP service running on port: ${process.env.INGREDIENT_TCP_PORT}`);

  await app.listen(process.env.INGREDIENT_REST_PORT);

  logger.log(
    `HTTP service running on port: ${process.env.INGREDIENT_REST_PORT}`,
  );
}
bootstrap();
