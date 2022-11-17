import { Observable } from 'rxjs';

export interface Recipe {
  id?: number;
  name?: string;
  ingridients?: Ingridient[];
}

export interface Ingridient {
  id?: number;
  name?: string;
  portion?: string;
  recipe?: Recipe;
  nutrition?: Nutrition;
}

export interface Nutrition {
  ingridient?: Ingridient;
  calories?: string;
  fat?: string;
  sodium?: string;
  fiber?: string;
  sugar?: string;
  protein?: string;
}

export interface IngridientsList {
  ingridients: Ingridient[];
}

export interface NutritionsService {
  getNutritionByIngridientId(ingridient: Ingridient): Observable<Nutrition>;
}
