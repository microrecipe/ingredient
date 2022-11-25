import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices/enums';
import { ClientsModule } from '@nestjs/microservices/module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { GrpcController } from './app-grpc.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Ingridient } from './ingridient.entity';
import { IngridientRecipe } from './ingridients-nutritions.entity';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('INGRIDIENT_DB_HOST'),
        port: Number(configService.get('INGRIDIENT_DB_PORT')),
        username: configService.get('INGRIDIENT_DB_USERNAME'),
        password: configService.get('INGRIDIENT_DB_PASSWORD'),
        database: configService.get('INGRIDIENT_DB_NAME'),
        entities: [__dirname + './*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Ingridient, IngridientRecipe]),
  ],
  controllers: [AppController, GrpcController],
  providers: [AppService],
})
export class AppModule {}
