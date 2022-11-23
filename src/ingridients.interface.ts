import { Observable } from 'rxjs';

export interface IRecipe {
  id?: number;
  name?: string;
  ingridients?: IIngridient[];
}

export interface IIngridient {
  id?: number;
  name?: string;
  portion?: string;
  nutritions?: INutrition;
}

export interface INutrition {
  id?: number;
  name?: string;
  per_gram?: string;
  ingridient_id?: number;
}

export interface IngridientsList {
  ingridients: IIngridient[];
}

export interface NutritionsList {
  nutritions?: INutrition[];
}

export interface EditNutrition {
  id?: number;
  per_gram?: string;
  ingridient_id?: number;
}

export interface NutritionsService {
  getNutritionByIngridientId(
    ingridient: IIngridient,
  ): Observable<NutritionsList>;
}
