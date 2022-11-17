import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Transport } from '@nestjs/microservices/enums';
import { ClientsModule } from '@nestjs/microservices/module';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'NUTRITIONS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'nutritions',
          protoPath: join(__dirname, '../src/nutritions.proto'),
          url: `${process.env.NUTRITION_HOST}:${process.env.NUTRITION_GRPC_PORT}`,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
