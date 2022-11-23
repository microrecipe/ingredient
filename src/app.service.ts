import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm';
import { Ingridient } from './ingridient.entity';
import { IRecipe, NutritionsService } from './ingridients.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private nutritionsService: NutritionsService;

  constructor(
    @Inject(ClientPackageNames.nutritionGRPC)
    private nutritionGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.nutritionTCP)
    private nutritionTcpClient: ClientProxy,
    @InjectRepository(Ingridient)
    private repository: Repository<Ingridient>,
  ) {}

  onModuleInit() {
    this.nutritionsService =
      this.nutritionGrpcClient.getService<NutritionsService>(
        'NutritionsService',
      );
  }

  async listIngridientsByRecipeId(recipe: IRecipe): Promise<Ingridient[]> {
    const _ingridient = await this.repository.find({
      where: {
        recipeId: recipe.id,
      },
    });

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
          _ing.nutritions = value.nutritions;
        });
      ingridientsList.push(_ing);
    }

    return ingridientsList;
  }

  async listIngridients(): Promise<Ingridient[]> {
    const ingridients = await this.repository.find();

    const ingridientsList: Ingridient[] = [];

    for (const _ing of ingridients) {
      await this.nutritionsService
        .getNutritionByIngridientId({
          id: _ing.id,
        })
        .forEach((value) => {
          _ing.nutritions = value.nutritions;
        });
      ingridientsList.push(_ing);
    }

    return ingridientsList;
  }
}
