import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { IIngridient, INutrition } from './ingridients.interface';

export class NutritionsDTO {
  static toDTO(nutrition: INutrition) {
    const res = new NutritionsDTO();

    res.id = nutrition.id;
    res.name = nutrition.name;
    res.perGram = nutrition.perGram;

    return res;
  }

  id: number;
  name: string;

  @Expose({ name: 'per_gram' })
  perGram: string;
}

export class NutritionBody {
  id: number;
  per_gram: string;
}

export class AddIngridientBody {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  nutritions: NutritionBody[];
}

export class IngridientsDTO {
  static toDTO(ingridient: IIngridient) {
    const res = new IngridientsDTO();

    res.id = ingridient.id;
    res.name = ingridient.name;
    res.unit = ingridient.unit;
    res.nutritions = ingridient.nutritions
      ? ingridient.nutritions.map((nutrition) => NutritionsDTO.toDTO(nutrition))
      : [];

    return res;
  }

  id: number;
  name: string;
  unit: string;
  nutritions: NutritionsDTO[];
}
