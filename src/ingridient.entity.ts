import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { INutrition } from './ingridients.interface';

@Entity('ingridients')
export class Ingridient {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'recipe_id',
    type: 'int',
    nullable: true,
  })
  recipeId: number;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true,
  })
  name: string;

  @Column({
    name: 'portion',
    type: 'varchar',
    nullable: true,
  })
  portion: string;

  nutritions?: INutrition[];
}
