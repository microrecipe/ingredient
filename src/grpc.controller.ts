import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcService } from './grpc.service';
import {
  IIngridient,
  IngridientId,
  ListIngridientsRes,
  RecipeId,
  SetIngridient,
  SetIngridientRes,
} from './ingridients.interface';

@Controller()
export class GrpcController {
  constructor(private readonly service: GrpcService) {}

  @GrpcMethod('IngridientsService')
  async listIngridientsByRecipeId(
    recipe: RecipeId,
  ): Promise<ListIngridientsRes> {
    return {
      ingridients: await this.service.listIngridientsByRecipeId(recipe.id),
    };
  }

  @GrpcMethod('IngridientsService')
  async getIngridientById(ingridientId: IngridientId): Promise<IIngridient> {
    return await this.service.getIngridientById(ingridientId.id);
  }

  @GrpcMethod('IngridientsService')
  async setIngridientToRecipe(
    setIngridient: SetIngridient,
  ): Promise<SetIngridientRes> {
    return await this.service.setIngridientToRecipe(setIngridient);
  }
}
