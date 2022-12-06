import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices/enums';
import { ClientsModule } from '@nestjs/microservices/module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { IngredientsController } from './ingredients/ingredients.controller';
import { IngredientsService } from './ingredients/ingredients.service';
import { Ingredient } from './entities/ingredient.entity';
import { ClientPackageNames } from './ingredients.enum';
import { JwtStrategy } from './auth/jwt.strategy';
import { IngredientRecipe } from './entities/ingredient-nutrition.entity';
import { IngredientsGrpcController } from './ingredients/ingredients-grpc.controller';
import { IngredientsGrpcService } from './ingredients/ingredients-grpc.service';

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
          protoPath: join(__dirname, '../src/proto/nutritions.proto'),
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
      {
        name: ClientPackageNames.ingredientDeleteTopic,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'microrecipe',
            brokers: process.env.KAFKA_BROKERS.split(','),
          },
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('INGREDIENT_DB_HOST'),
        port: Number(configService.get('INGREDIENT_DB_PORT')),
        username: configService.get('INGREDIENT_DB_USERNAME'),
        password: configService.get('INGREDIENT_DB_PASSWORD'),
        database: configService.get('INGREDIENT_DB_NAME'),
        entities: [__dirname + './entities/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Ingredient, IngredientRecipe]),
  ],
  controllers: [IngredientsController, IngredientsGrpcController],
  providers: [IngredientsService, JwtStrategy, IngredientsGrpcService],
})
export class AppModule {}
