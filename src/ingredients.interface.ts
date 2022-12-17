import { Observable } from 'rxjs';

export interface INutrition {
  id?: number;
  name?: string;
  perGram?: string;
  ingredientId?: number;
}

export interface IIngredient {
  id?: number;
  name?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  nutritions?: INutrition[];
  recipeId?: number;
}

export interface IngredientId {
  id: number;
}

export interface AddIngredient {
  name: string;
  unit: string;
  price: number;
  nutritions: SetNutrition[];
}

export interface SetIngredient {
  id: number;
  quantity: number;
  recipeId: number;
}

export interface SetIngredientRes {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  nutritions: INutrition[];
}

export interface NutritionsList {
  nutritions?: INutrition[];
}

export interface SetNutrition {
  id?: number;
  perGram?: string;
  ingredientId?: number;
}

export interface GetNutrition {
  id: number;
}

export interface RecipeId {
  id: number;
}

export interface ListIngredientsRes {
  ingredients: IIngredient[];
}

export interface NutritionsService {
  listNutritionsByIngredientId(
    ingredient: IIngredient,
  ): Observable<NutritionsList>;

  setNutritionToIngredient(nutrition: SetNutrition): Observable<INutrition>;

  getNutritionById(nutrition: GetNutrition): Observable<INutrition>;

  removeNutritionDataForIngredient(ingredient: IIngredient): Observable<void>;
}

export interface HandleDeleteRecipePayload {
  recipe_id: string;
}

export interface UserType {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}
