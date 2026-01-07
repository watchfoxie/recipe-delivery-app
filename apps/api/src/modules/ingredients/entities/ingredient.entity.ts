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
import { RecipeIngredient } from '../../recipes/entities/recipe-ingredient.entity';

@Entity('ingredient')
@Index('idx_ingredient_category', ['ingredientCategoryId'])
@Index('uq_ingredient_name', ['name'], { unique: true })
export class Ingredient {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'ingredient_category_id', type: 'int', nullable: true })
  ingredientCategoryId?: number | null;

  @Column({ type: 'varchar', length: 191, unique: true })
  name!: string;

  @Column({ name: 'synonyms_json', type: 'json', nullable: true })
  synonymsJson?: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => RecipeIngredient, (ri) => ri.ingredient)
  recipeIngredients?: RecipeIngredient[];
}