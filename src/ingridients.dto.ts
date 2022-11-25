import { IIngridient, INutrition } from './ingridients.interface';

export class NutritionsDTO {
  static toDTO(nutrition: INutrition) {
    const res = new NutritionsDTO();

    res.id = nutrition.id;
    res.name = nutrition.name;
    res.per_gram = nutrition.perGram;

    return res;
  }

  id: number;
  name: string;
  per_gram: string;
}

export class NutritionBody {
  id: number;
  per_gram: string;
}

export class AddIngridientBody {
  name: string;
  nutritions: NutritionBody[];
}

export class IngridientsDTO {
  static toDTO(ingridient: IIngridient) {
    const res = new IngridientsDTO();

    res.id = ingridient.id;
    res.name = ingridient.name;
    res.nutritions = ingridient.nutritions
      ? ingridient.nutritions.map((nutrition) => NutritionsDTO.toDTO(nutrition))
      : [];

    return res;
  }

  id: number;
  name: string;
  nutritions: NutritionsDTO[];
}
