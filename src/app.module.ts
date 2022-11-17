import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices/enums';
import { ClientsModule } from '@nestjs/microservices/module';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NUTRITIONS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'nutritions',
          protoPath: join(__dirname, '../src/nutritions.proto'),
          url: 'localhost:3009',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
