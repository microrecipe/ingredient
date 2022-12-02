import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcService } from './grpc.service';
import {
  IIngredient,
  IngredientId,
  ListIngredientsRes,
  RecipeId,
  SetIngredient,
  SetIngredientRes,
} from './ingredients.interface';

@Controller()
export class GrpcController {
  constructor(private readonly service: GrpcService) {}

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
