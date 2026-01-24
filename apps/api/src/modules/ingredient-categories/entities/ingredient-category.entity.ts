import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity('ingredient_category')
@Index('uq_ingredient_category_slug', ['slug'], { unique: true })
export class IngredientCategory {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 191 })
  name!: string;

  @Column({ type: 'varchar', length: 191, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'icon_class', type: 'varchar', length: 100, nullable: true })
  iconClass?: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  @OneToMany('Ingredient', 'category')
  ingredients?: Ingredient[];
}
