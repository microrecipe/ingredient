import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  RecipeId,
  ListIngredientsRes,
  IngredientId,
  IIngredient,
  SetIngredient,
  SetIngredientRes,
} from '../ingredients.interface';
import { IngredientsGrpcService } from './ingredients-grpc.service';

@Controller()
export class IngredientsGrpcController {
  constructor(private readonly service: IngredientsGrpcService) {}

  @GrpcMethod('IngredientsService')
  async listIngredientsByRecipeId(
    recipe: RecipeId,
  ): Promise<ListIngredientsRes> {
    return {
      ingredients: await this.service.listIngredientsByRecipeId(recipe.id),
    };
  }

  @GrpcMethod('IngredientsService')
  async getIngredientById(ingredientId: IngredientId): Promise<IIngredient> {
    return await this.service.getIngredientById(ingredientId.id);
  }

  @GrpcMethod('IngredientsService')
  async setIngredientToRecipe(
    setIngredient: SetIngredient,
  ): Promise<SetIngredientRes> {
    return await this.service.setIngredientToRecipe(setIngredient);
  }
}
