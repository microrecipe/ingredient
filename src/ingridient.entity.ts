import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IngridientRecipe } from './ingridients-nutritions.entity';

@Entity('ingridients')
export class Ingridient {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: true,
  })
  name: string;

  @OneToMany(
    () => IngridientRecipe,
    (ingridientRecipe) => ingridientRecipe.ingridient.id,
    {
      onDelete: 'CASCADE',
    },
  )
  private ingridientsRecipes: IngridientRecipe[];
}
