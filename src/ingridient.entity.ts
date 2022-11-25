import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
