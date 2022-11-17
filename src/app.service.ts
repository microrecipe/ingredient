import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc } from '@nestjs/microservices';
import { Ingridient, NutritionsService, Recipe } from './ingridients.interface';

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
    @Inject('NUTRITIONS_PACKAGE')
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.nutritionsService =
      this.client.getService<NutritionsService>('NutritionsService');
  }

  async listIngridientsByRecipeId(recipe: Recipe): Promise<Ingridient[]> {
    const _ingridient = Ingridients.filter((ing) => ing.recipe.id == recipe.id);

    if (!_ingridient || !_ingridient.length) {
      throw new NotFoundException('Ingridient not found');
    }

    const ingridientsList: Ingridient[] = [];

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

    return ingridientsList;
  }
}
