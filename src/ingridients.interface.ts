import { Observable } from 'rxjs';

export interface Ingridient {
  id?: number;
  name?: string;
  portion?: string;
  nutrition?: Nutrition;
}

export interface Nutrition {
  ingridient: Ingridient;
  calories: string;
  fat: string;
  sodium: string;
  fiber: string;
  sugar: string;
  protein: string;
}

export interface NutritionsService {
  getNutritionByIngridientId(ingridient: Ingridient): Observable<Nutrition>;
}
