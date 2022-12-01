import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc, ClientKafka, ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm';
import { Ingridient } from './ingridient.entity';
import { IngridientRecipe } from './ingridients-nutritions.entity';
import { IngridientsDTO } from './ingridients.dto';
import {
  AddIngridient,
  IIngridient,
  INutrition,
  NutritionsService,
  UserType,
} from './ingridients.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class AppService implements OnModuleInit {
  private nutritionsService: NutritionsService;
  private logger = new Logger('IngridientsService');

  constructor(
    @Inject(ClientPackageNames.nutritionGRPC)
    private nutritionGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.nutritionTCP)
    private nutritionTcpClient: ClientProxy,
    @Inject(ClientPackageNames.ingridientDeleteTopic)
    private ingridientDeleteTopic: ClientKafka,
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

  async addIngridient(
    data: AddIngridient,
    user: UserType,
  ): Promise<IngridientsDTO> {
    for (const nutrition of data.nutritions) {
      await this.nutritionsService
        .getNutritionById({ id: nutrition.id })
        .forEach((val) => {
          if (!val) {
            throw new NotFoundException('Nutrition not found');
          }
        });
    }

    const ingridient = await this.ingridientsRepository.save(
      this.ingridientsRepository.create({
        name: data.name,
        unit: data.unit,
        userId: user.id,
        price: data.price,
      }),
    );

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

  async deleteIngridient(id: number, user: UserType): Promise<string> {
    const ingridient = await this.ingridientsRepository.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!ingridient) {
      throw new NotFoundException('Ingridient not found');
    }

    await this.ingridientsRepository.remove(ingridient);

    this.ingridientDeleteTopic
      .emit('ingridient.deleted', {
        ingridient_id: id,
      })
      .forEach(() => {
        this.logger.log('ingridient.deleted event emitted');
      });

    return 'Ingridient deleted';
  }

  async handleRecipeDeleted(recipeId: number): Promise<void> {
    this.logger.log('recipe.deleted received');

    const ingridientsRecipes = await this.ingridientsRecipesRepository.find({
      where: {
        recipeId,
      },
    });

    await this.ingridientsRecipesRepository.remove(ingridientsRecipes);

    this.logger.log('ingridients_recipe deleted');

    return;
  }
}
