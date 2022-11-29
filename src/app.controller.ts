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
import { AppService } from './app.service';
import { UserPayload } from './auth.decorator';
import { JwtAuthGuard } from './auth.guard';
import { AddIngridientBody, IngridientsDTO } from './ingridients.dto';
import { HandleDeleteRecipePayload, UserType } from './ingridients.interface';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get('ingridients')
  async listIngridients(): Promise<IngridientsDTO[]> {
    return await this.service.listIngridients();
  }

  @Post('ingridients')
  @UseGuards(JwtAuthGuard)
  async addIngridient(
    @Body() body: AddIngridientBody,
    @UserPayload() user: UserType,
  ): Promise<IngridientsDTO> {
    return await this.service.addIngridient(
      {
        name: body.name,
        unit: body.unit,
        nutritions: body.nutritions.map((nutrition) => ({
          id: nutrition.id,
          perGram: nutrition.per_gram,
        })),
      },
      user,
    );
  }

  @Delete('ingridients/:id')
  @UseGuards(JwtAuthGuard)
  async deleteIngridient(
    @Param('id') id: number,
    @UserPayload() user: UserType,
  ): Promise<string> {
    return await this.service.deleteIngridient(id, user);
  }

  @EventPattern('recipe.deleted')
  async handleRecipeDeleted(
    @Payload() message: HandleDeleteRecipePayload,
  ): Promise<void> {
    return await this.service.handleRecipeDeleted(Number(message.recipe_id));
  }
}
