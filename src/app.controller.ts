import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { IngridientsList, Recipe } from './ingridients.interface';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @GrpcMethod('IngridientsService')
  async listIngridientsByRecipeId(recipe: Recipe): Promise<IngridientsList> {
    return {
      ingridients: await this.service.listIngridientsByRecipeId({
        id: recipe.id,
      }),
    };
  }
}
