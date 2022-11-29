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

  @Column({
    name: 'unit',
    type: 'varchar',
    nullable: true,
  })
  unit: string;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
  })
  userId: number;
}
