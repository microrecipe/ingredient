import { Controller, Get, Body, Post } from '@nestjs/common';
import { Delete, Param } from '@nestjs/common/decorators';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { AddIngridientBody, IngridientsDTO } from './ingridients.dto';
import { HandleDeleteRecipePayload } from './ingridients.interface';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get('ingridients')
  async listIngridients(): Promise<IngridientsDTO[]> {
    return await this.service.listIngridients();
  }

  @Post('ingridients')
  async addIngridient(
    @Body() body: AddIngridientBody,
  ): Promise<IngridientsDTO> {
    return await this.service.addIngridient({
      name: body.name,
      nutritions: body.nutritions.map((nutrition) => ({
        id: nutrition.id,
        perGram: nutrition.per_gram,
      })),
    });
  }

  @Delete('ingridients/:id')
  async deleteIngridient(@Param('id') id: number): Promise<string> {
    return await this.service.deleteIngridient(id);
  }

  @EventPattern('recipe.deleted')
  async handleRecipeDeleted(
    @Payload() message: HandleDeleteRecipePayload,
  ): Promise<void> {
    return await this.service.handleRecipeDeleted(Number(message.recipe_id));
  }
}
