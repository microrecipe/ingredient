import {
  Controller,
  Get,
  Body,
  Post,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IngredientsService } from './ingredients.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AddIngredientBody, IngredientsDTO } from '../ingredients.dto';
import { HandleDeleteRecipePayload, UserType } from '../ingredients.interface';
import { UserPayload } from '../auth/auth.decorator';

@Controller('ingredients')
@UseInterceptors(ClassSerializerInterceptor)
export class IngredientsController {
  constructor(private readonly service: IngredientsService) {}

  @Get()
  async listIngredients(): Promise<IngredientsDTO[]> {
    return await this.service.listIngredients();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addIngredient(
    @Body() body: AddIngredientBody,
    @UserPayload() user: UserType,
  ): Promise<IngredientsDTO> {
    return await this.service.addIngredient(
      {
        name: body.name,
        unit: body.unit,
        price: body.price,
        nutritions: body.nutritions.map((nutrition) => ({
          id: nutrition.id,
          perGram: nutrition.per_gram,
        })),
      },
      user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteIngredient(
    @Param('id') id: number,
    @UserPayload() user: UserType,
  ): Promise<string> {
    return await this.service.deleteIngredient(id, user);
  }

  @EventPattern('recipe.deleted')
  async handleRecipeDeleted(
    @Payload() message: HandleDeleteRecipePayload,
  ): Promise<void> {
    return await this.service.handleRecipeDeleted(Number(message.recipe_id));
  }
}
