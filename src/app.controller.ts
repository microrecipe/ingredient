import { Controller, Get } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ListIngridientsDTO } from './ingridients.dto';
import { IngridientsList, IRecipe } from './ingridients.interface';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get('ingridients')
  async listIngridients(): Promise<ListIngridientsDTO> {
    return ListIngridientsDTO.toDTO(await this.service.listIngridients());
  }
}
