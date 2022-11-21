import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import {
  Ingridient,
  Nutrition,
  NutritionsService,
  Recipe,
} from './ingridients.interface';
import { ClientPackageNames } from './package-names.enum';

const Ingridients: Ingridient[] = [
  {
    id: 1,
    name: 'Chicken leg',
    portion: '1 piece',
    nutrition: null,
    recipe: { id: 1 },
  },
  {
    id: 2,
    name: 'Vegetable oil',
    portion: '300ml',
    nutrition: null,
    recipe: { id: 1 },
  },
];

@Injectable()
export class AppService implements OnModuleInit {
  private nutritionsService: NutritionsService;

  constructor(
    @Inject(ClientPackageNames.nutritionGRPC)
    private nutritionGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.nutritionTCP)
    private nutritionTcpClient: ClientProxy,
  ) {}

  async onModuleInit() {
    this.nutritionsService =
      this.nutritionGrpcClient.getService<NutritionsService>(
        'NutritionsService',
      );

    await this.nutritionTcpClient.connect();
  }

  async listIngridientsByRecipeId(
    recipe: Recipe,
    transportMethod?: 'GRPC' | 'TCP',
  ): Promise<Ingridient[]> {
    const _ingridient = Ingridients.filter((ing) => ing.recipe.id == recipe.id);

    if (!_ingridient || !_ingridient.length) {
      throw new NotFoundException('Ingridient not found');
    }

    const ingridientsList: Ingridient[] = [];

    switch (transportMethod) {
      case 'GRPC': {
        for (const _ing of _ingridient) {
          await this.nutritionsService
            .getNutritionByIngridientId({
              id: _ing.id,
            })
            .forEach((value) => {
              _ing.nutrition = value;
            });
          ingridientsList.push(_ing);
        }
        break;
      }
      case 'TCP': {
        for (const _ing of _ingridient) {
          await this.nutritionTcpClient
            .send<Nutrition, Ingridient>('getNutrition', {
              id: _ing.id,
            })
            .forEach((value) => {
              _ing.nutrition = value;
            });
          ingridientsList.push(_ing);
        }
        break;
      }
      default:
        break;
    }

    return ingridientsList;
  }
}
