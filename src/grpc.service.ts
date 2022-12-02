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
import { Ingredient } from './ingredient.entity';
import { IngredientRecipe } from './ingredients-nutritions.entity';
import {
  NutritionsService,
  IIngredient,
  SetIngredient,
  SetIngredientRes,
  INutrition,
} from './ingredients.interface';
import { ClientPackageNames } from './package-names.enum';

@Injectable()
export class GrpcService implements OnModuleInit {
  private nutritionsService: NutritionsService;
  private logger = new Logger('IngredientsService');

  constructor(
    @Inject(ClientPackageNames.nutritionGRPC)
    private nutritionGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.nutritionTCP)
    private nutritionTcpClient: ClientProxy,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(IngredientRecipe)
    private ingredientsRecipesRepository: Repository<IngredientRecipe>,
  ) {}

  onModuleInit() {
    this.nutritionsService =
      this.nutritionGrpcClient.getService<NutritionsService>(
        'NutritionsService',
      );
  }
  async listIngredientsByRecipeId(recipeId: number): Promise<IIngredient[]> {
    const ingredientsRecipes = await this.ingredientsRecipesRepository.find({
      where: {
        recipeId,
      },
    });

    const ingredients = await this.ingredientsRepository.find({
      where: {
        id: In(
          ingredientsRecipes.map(
            (ingredientRecipe) => ingredientRecipe.ingredient?.id,
          ),
        ),
      },
    });

    const ingredientsList: IIngredient[] = [];

    for (const ingredient of ingredients) {
      await this.nutritionsService
        .listNutritionsByIngredientId({
          id: ingredient.id,
        })
        .forEach((value) => {
          ingredientsList.push({
            ...ingredient,
            recipeId,
            quantity: ingredientsRecipes.find(
              (ingredientRecipe) =>
                ingredient.id === ingredientRecipe.ingredient.id,
            ).quantity,
            nutritions: value.nutritions,
          });
        });
    }

    return ingredientsList;
  }

  async getIngredientById(id: number): Promise<IIngredient> {
    return await this.ingredientsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async setIngredientToRecipe(data: SetIngredient): Promise<SetIngredientRes> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: {
        id: data.id,
      },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    await this.ingredientsRecipesRepository.save(
      this.ingredientsRecipesRepository.create({
        quantity: data.quantity,
        recipeId: data.recipeId,
        ingredient: ingredient,
      }),
    );

    let nutritions: INutrition[];

    await this.nutritionsService
      .listNutritionsByIngredientId({
        id: ingredient.id,
      })
      .forEach((value) => {
        nutritions = value.nutritions;
      });

    return {
      id: ingredient.id,
      name: ingredient.name,
      quantity: data.quantity,
      unit: ingredient.unit,
      nutritions,
    };
  }
}
