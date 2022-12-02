import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity('ingredients_recipes')
export class IngredientRecipe {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'quantity',
    type: 'int',
    nullable: true,
  })
  quantity: number;

  @Column({
    name: 'recipe_id',
    type: 'int',
    nullable: true,
  })
  recipeId: number;

  @ManyToOne(() => Ingredient, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'ingredient_id' })
  ingredient: Ingredient;
}
