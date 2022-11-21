import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Transport } from '@nestjs/microservices/enums';
import { ClientsModule } from '@nestjs/microservices/module';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientPackageNames } from './package-names.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: ClientPackageNames.nutritionGRPC,
        transport: Transport.GRPC,
        options: {
          package: 'nutritions',
          protoPath: join(__dirname, '../src/nutritions.proto'),
          url: `${process.env.NUTRITION_HOST}:${process.env.NUTRITION_GRPC_PORT}`,
        },
      },
      {
        name: ClientPackageNames.nutritionTCP,
        transport: Transport.TCP,
        options: {
          host: process.env.NUTRITION_HOST,
          port: Number(process.env.NUTRITION_TCP_PORT),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
