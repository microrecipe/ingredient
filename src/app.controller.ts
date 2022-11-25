import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AddIngridientBody, IngridientsDTO } from './ingridients.dto';

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
}
