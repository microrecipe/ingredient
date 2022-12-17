import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ClientGrpc, ClientKafka, ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { IngredientsDTO } from '../ingredients.dto';
import {
  AddIngredient,
  IIngredient,
  INutrition,
  NutritionsService,
  UserType,
} from '../ingredients.interface';
import { ClientPackageNames } from '../ingredients.enum';
import { IngredientRecipe } from '../entities/ingredient-nutrition.entity';

@Injectable()
export class IngredientsService implements OnModuleInit {
  private nutritionsService: NutritionsService;
  private logger = new Logger('IngredientsService');

  constructor(
    @Inject(ClientPackageNames.nutritionGRPC)
    private nutritionGrpcClient: ClientGrpc,
    @Inject(ClientPackageNames.nutritionTCP)
    private nutritionTcpClient: ClientProxy,
    @Inject(ClientPackageNames.ingredientDeleteTopic)
    private ingredientDeleteTopic: ClientKafka,
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

  async listIngredients(): Promise<IngredientsDTO[]> {
    const ingredients = await this.ingredientsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    const ingredientsList: IIngredient[] = [];

    for (const ingredient of ingredients) {
      await this.nutritionsService
        .listNutritionsByIngredientId({
          id: ingredient.id,
        })
        .forEach((value) => {
          ingredientsList.push({ ...ingredient, nutritions: value.nutritions });
        });
    }

    return ingredientsList.map((ingredient) =>
      IngredientsDTO.toDTO(ingredient),
    );
  }

  async getIngredientById(id: number): Promise<IngredientsDTO> {
    try {
      const ingredient = await this.ingredientsRepository.findOneByOrFail({
        id,
      });

      let _ingredient: IIngredient;

      await this.nutritionsService
        .listNutritionsByIngredientId({
          id: ingredient.id,
        })
        .forEach((value) => {
          _ingredient = { ...ingredient, nutritions: value.nutritions };
        });

      return IngredientsDTO.toDTO(_ingredient);
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('Ingredient not found');
      } else {
        throw err;
      }
    }
  }

  async addIngredient(
    data: AddIngredient,
    user: UserType,
  ): Promise<IngredientsDTO> {
    for (const nutrition of data.nutritions) {
      await this.nutritionsService
        .getNutritionById({ id: nutrition.id })
        .forEach((val) => {
          if (!val) {
            throw new NotFoundException('Nutrition not found');
          }
        });
    }

    const ingredient = await this.ingredientsRepository.save(
      this.ingredientsRepository.create({
        name: data.name,
        unit: data.unit,
        userId: user.id,
        price: data.price,
      }),
    );

    const _nutritions: INutrition[] = [];

    for (const nutrition of data.nutritions) {
      await this.nutritionsService
        .setNutritionToIngredient({
          id: nutrition.id,
          perGram: nutrition.perGram,
          ingredientId: ingredient.id,
        })
        .forEach((val) => {
          _nutritions.push(val);
        });
    }

    return IngredientsDTO.toDTO({ ...ingredient, nutritions: _nutritions });
  }

  async editIngredient(
    id: number,
    data: AddIngredient,
    user: UserType,
  ): Promise<IngredientsDTO> {
    try {
      const ingredient = await this.ingredientsRepository.findOneByOrFail({
        id,
        userId: user.id,
      });

      for (const nutrition of data.nutritions) {
        await this.nutritionsService
          .getNutritionById({ id: nutrition.id })
          .forEach((val) => {
            if (!val) {
              throw new NotFoundException('Nutrition not found');
            }
          });
      }

      if (ingredient.name !== data.name) ingredient.name = data.name;
      if (ingredient.price !== data.price) ingredient.price = data.price;
      if (ingredient.unit !== data.unit) ingredient.unit = data.unit;

      const _nutritions: INutrition[] = [];

      await this.nutritionsService
        .removeNutritionDataForIngredient({
          id: ingredient.id,
        })
        .forEach((val: unknown) => val);

      for (const nutrition of data.nutritions) {
        await this.nutritionsService
          .setNutritionToIngredient({
            id: nutrition.id,
            perGram: nutrition.perGram,
            ingredientId: ingredient.id,
          })
          .forEach((val) => {
            _nutritions.push(val);
          });
      }

      await this.ingredientsRepository.save(ingredient);

      return IngredientsDTO.toDTO({ ...ingredient, nutritions: _nutritions });
    } catch (err) {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundException('Ingredient not found');
      } else {
        throw err;
      }
    }
  }

  async deleteIngredient(id: number, user: UserType): Promise<string> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    await this.ingredientsRepository.softRemove(ingredient);

    this.ingredientDeleteTopic
      .emit('ingredient.deleted', {
        ingredient_id: id,
      })
      .forEach(() => {
        this.logger.log('ingredient.deleted event emitted');
      });

    return 'Ingredient deleted';
  }

  async handleRecipeDeleted(recipeId: number): Promise<void> {
    this.logger.log('recipe.deleted received');

    const ingredientsRecipes =
      await this.ingredientsRecipesRepository.findOneByOrFail({
        recipeId,
      });

    await this.ingredientsRecipesRepository.softRemove(ingredientsRecipes);

    this.logger.log('ingredients_recipe deleted');

    return;
  }
}
