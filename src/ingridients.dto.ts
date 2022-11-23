import { Ingridient } from './ingridient.entity';
import { INutrition } from './ingridients.interface';

export class IngridientsDTO {
  static toDTO(ingridient: Ingridient) {
    const res = new IngridientsDTO();

    res.id = ingridient.id;
    res.name = ingridient.name;
    res.portion = ingridient.portion;
    res.nutrition = ingridient.nutritions || [];

    return res;
  }

  id: number;
  name: string;
  portion: string;
  nutrition: INutrition[];
}

export class ListIngridientsDTO {
  static toDTO(ingridients: Ingridient[]) {
    const res = new ListIngridientsDTO();

    res.ingridients = ingridients.map((ingridient) =>
      IngridientsDTO.toDTO(ingridient),
    );

    return res;
  }
  ingridients: IngridientsDTO[];
}
