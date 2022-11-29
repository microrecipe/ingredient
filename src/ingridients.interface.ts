import { Observable } from 'rxjs';

export interface INutrition {
  id?: number;
  name?: string;
  perGram?: string;
  ingridientId?: number;
}

export interface IIngridient {
  id?: number;
  name?: string;
  quantity?: number;
  nutritions?: INutrition[];
  recipeId?: number;
  unit?: string;
}

export interface IIRecipe {
  id?: number;
  name?: string;
  ingridients?: IIngridient[];
}

export interface IngridientId {
  id: number;
}

export interface IngridientsList {
  ingridients: IIngridient[];
}

export interface AddIngridient {
  name: string;
  unit: string;
  nutritions: SetNutrition[];
}

export interface SetIngridient {
  id: number;
  quantity: number;
  recipeId: number;
}

export interface SetIngridientRes {
  id: number;
  name: string;
  quantity: number;
  nutritions: INutrition[];
}

export interface NutritionsList {
  nutritions?: INutrition[];
}

export interface SetNutrition {
  id?: number;
  perGram?: string;
  ingridientId?: number;
}

export interface GetNutrition {
  id: number;
}

export interface RecipeId {
  id: number;
}

export interface ListIngridientsRes {
  ingridients: IIngridient[];
}

export interface NutritionsService {
  listNutritionsByIngridientId(
    ingridient: IIngridient,
  ): Observable<NutritionsList>;

  setNutritionToIngridient(nutrition: SetNutrition): Observable<INutrition>;

  getNutritionById(nutrition: GetNutrition): Observable<INutrition>;
}

export interface HandleDeleteRecipePayload {
  recipe_id: string;
}

export interface UserType {
  id: number;
  name: string;
  email: string;
}
