import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { IIngredient, INutrition } from './ingredients.interface';

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

export class AddIngredientBody {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsNumber()
  price: number;

  nutritions: NutritionBody[];
}

export class IngredientsDTO {
  static toDTO(ingredient: IIngredient) {
    const res = new IngredientsDTO();

    res.id = ingredient.id;
    res.name = ingredient.name;
    res.unit = ingredient.unit;
    res.price = ingredient.price;
    res.nutritions = ingredient.nutritions
      ? ingredient.nutritions.map((nutrition) => NutritionsDTO.toDTO(nutrition))
      : [];

    return res;
  }

  id: number;
  name: string;
  unit: string;
  nutritions: NutritionsDTO[];
  price: number;
}
