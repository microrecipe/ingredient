import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc } from '@nestjs/microservices';
import { Ingridient, NutritionsService } from './ingridients.interface';

const Ingridients: Ingridient[] = [
  {
    id: 1,
    name: 'Chicken leg',
    portion: '1 piece',
    nutrition: null,
  },
  {
    id: 2,
    name: 'Vegetable oil',
    portion: '300ml',
    nutrition: null,
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

  async getIngridientById(ingridient: Ingridient): Promise<Ingridient> {
    const _ingridient = Ingridients.find((ing) => ing.id == ingridient.id);

    if (!_ingridient) {
      throw new NotFoundException('Ingridient not found');
    }

    await this.nutritionsService
      .getNutritionByIngridientId({
        id: ingridient.id,
      })
      .forEach((value) => {
        _ingridient.nutrition = value;
      });

    return _ingridient;
  }
}
