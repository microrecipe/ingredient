import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ingridient } from './ingridient.entity';
import { IngridientRecipe } from './ingridients-nutritions.entity';
import {
  NutritionsService,
  IIngridient,
  SetIngridient,
  SetIngridientRes,
  INutrition,
} from './ingridients.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class GrpcService implements OnModuleInit {
  private nutritionsService: NutritionsService;
  private logger = new Logger('IngridientsService');

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
            quantity: ingridientsRecipes.find(
              (ingridientRecipe) =>
                ingridient.id === ingridientRecipe.ingridient.id,
            ).quantity,
            nutritions: value.nutritions,
          });
        });
    }

    return ingridientsList;
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

    await this.ingridientsRecipesRepository.save(
      this.ingridientsRecipesRepository.create({
        quantity: data.quantity,
        recipeId: data.recipeId,
        ingridient,
      }),
    );

    let nutritions: INutrition[];

    await this.nutritionsService
      .listNutritionsByIngridientId({
        id: ingridient.id,
      })
      .forEach((value) => {
        nutritions = value.nutritions;
      });

    return {
      id: ingridient.id,
      name: ingridient.name,
      quantity: data.quantity,
      unit: ingridient.unit,
      nutritions,
    };
  }
}
