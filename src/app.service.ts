import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { In, Repository } from 'typeorm';
import { Ingridient } from './ingridient.entity';
import { IngridientRecipe } from './ingridients-nutritions.entity';
import { IngridientsDTO } from './ingridients.dto';
import {
  AddIngridient,
  IIngridient,
  INutrition,
  NutritionsService,
  SetIngridient,
  SetIngridientRes,
} from './ingridients.interface';
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
    private ingridientsRepository: Repository<Ingridient>,
    @InjectRepository(IngridientRecipe)
    private ingridientsRecipesRepository: Repository<IngridientRecipe>,
  ) {}

  onModuleInit() {
    this.nutritionsService =
      this.nutritionGrpcClient.getService<NutritionsService>(
        'NutritionsService',
      );
  }

  async listIngridientsByRecipeId(recipeId: number): Promise<IIngridient[]> {
    const ingridientsRecipes = await this.ingridientsRecipesRepository.find({
      where: {
        recipeId,
      },
    });

    const ingridients = await this.ingridientsRepository.find({
      where: {
        id: In(
          ingridientsRecipes.map(
            (ingridientRecipe) => ingridientRecipe.ingridient?.id,
          ),
        ),
      },
    });

    const ingridientsList: IIngridient[] = [];

    for (const ingridient of ingridients) {
      await this.nutritionsService
        .listNutritionsByIngridientId({
          id: ingridient.id,
        })
        .forEach((value) => {
          ingridientsList.push({
            ...ingridient,
            recipeId,
            portion: ingridientsRecipes.find(
              (ingridientRecipe) =>
                ingridient.id === ingridientRecipe.ingridient.id,
            ).portion,
            nutritions: value.nutritions,
          });
        });
    }

    return ingridientsList;
  }

  async listIngridients(): Promise<IngridientsDTO[]> {
    const ingridients = await this.ingridientsRepository.find();

    const ingridientsList: IIngridient[] = [];

    for (const ingridient of ingridients) {
      await this.nutritionsService
        .listNutritionsByIngridientId({
          id: ingridient.id,
        })
        .forEach((value) => {
          ingridientsList.push({ ...ingridient, nutritions: value.nutritions });
        });
    }

    return ingridientsList.map((ingridient) =>
      IngridientsDTO.toDTO(ingridient),
    );
  }

  async addIngridient(data: AddIngridient): Promise<IngridientsDTO> {
    for (const nutrition of data.nutritions) {
      await this.nutritionsService
        .getNutritionById({ id: nutrition.id })
        .forEach((val) => {
          if (!val) {
            throw new NotFoundException('Nutrition not found');
          }
        });
    }

    const ingridient = this.ingridientsRepository.create({
      name: data.name,
    });

    await this.ingridientsRepository.save(ingridient);

    const _nutritions: INutrition[] = [];

    for (const nutrition of data.nutritions) {
      await this.nutritionsService
        .setNutritionToIngridient({
          id: nutrition.id,
          perGram: nutrition.perGram,
          ingridientId: ingridient.id,
        })
        .forEach((val) => {
          _nutritions.push(val);
        });
    }

    return IngridientsDTO.toDTO({ ...ingridient, nutritions: _nutritions });
  }

  async getIngridientById(id: number): Promise<IIngridient> {
    return await this.ingridientsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async setIngridientToRecipe(data: SetIngridient): Promise<SetIngridientRes> {
    const ingridient = await this.ingridientsRepository.findOne({
      where: {
        id: data.id,
      },
    });

    if (!ingridient) {
      throw new NotFoundException('Ingridient not found');
    }

    const ingridientRecipe = this.ingridientsRecipesRepository.create({
      portion: data.portion,
      recipeId: data.recipeId,
      ingridient,
    });

    await this.ingridientsRecipesRepository.save(ingridientRecipe);

    let nutritions;

    await this.nutritionsService
      .listNutritionsByIngridientId({
        id: ingridient.id,
      })
      .forEach((value) => {
        nutritions = value.nutritions;
      });

    return {
      ...ingridient,
      portion: data.portion,
      nutritions,
    };
  }
}
