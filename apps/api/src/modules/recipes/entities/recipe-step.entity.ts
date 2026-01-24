import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('recipe_step')
@Index('idx_recipe_step_recipe_order', ['recipeId', 'stepOrder'], { unique: true })
export class RecipeStep {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'recipe_id', type: 'int' })
  recipeId!: number;

  @Column({ name: 'step_order', type: 'int' })
  stepOrder!: number;

  @Column({ type: 'text' })
  text!: string;

  @Column({ name: 'timer_sec', type: 'int', nullable: true })
  timerSec?: number | null;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}