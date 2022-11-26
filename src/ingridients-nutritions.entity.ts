import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ingridient } from './ingridient.entity';

@Entity('ingridients_recipes')
export class IngridientRecipe {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'portion',
    type: 'varchar',
    nullable: true,
  })
  portion: string;

  @Column({
    name: 'recipe_id',
    type: 'int',
    nullable: true,
  })
  recipeId: number;

  @ManyToOne(() => Ingridient, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ referencedColumnName: 'id', name: 'ingridient_id' })
  ingridient: Ingridient;
}
