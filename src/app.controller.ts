import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Ingridient, NutritionsService } from './ingridients.interface';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @GrpcMethod('IngridientsService')
  async getIngridientById(ingridient: Ingridient): Promise<Ingridient> {
    return await this.service.getIngridientById({
      id: ingridient.id,
    });
  }

  @Get()
  getHello() {
    return 'Hello world';
  }
}
