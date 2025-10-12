import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Recipe } from './recipe.entity';

@Entity('recipe_ingredient')
@Unique('uq_recipe_ingredient_unique', ['recipeId', 'ingredientId', 'unit'])
@Index('idx_recipe_ingredient_recipe', ['recipeId'])
@Index('idx_recipe_ingredient_ingredient', ['ingredientId'])
export class RecipeIngredient {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'recipe_id', type: 'int' })
  recipeId!: number;

  @Column({ name: 'ingredient_id', type: 'int' })
  ingredientId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  quantity?: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  unit?: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  note?: string | null;

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient!: Ingredient;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}