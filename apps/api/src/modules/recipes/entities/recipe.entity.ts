import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipeStep } from './recipe-step.entity';
import { UserFavoriteRecipe } from '../../favorites/entities/user-favorite-recipe.entity';

export enum RecipeDifficulty {
  EASY = 'usor',
  MEDIUM = 'mediu',
  HARD = 'greu',
}

@Entity('recipe')
@Index('uq_recipe_slug', ['slug'], { unique: true })
@Index('idx_recipe_category', ['categoryId'])
@Index('idx_recipe_difficulty', ['difficulty'])
@Index('idx_recipe_total_time', ['totalTimeMin'])
@Index('idx_recipe_author', ['authorId'])
export class Recipe {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 191, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 191 })
  title!: string;

  @Column({ type: 'enum', enum: RecipeDifficulty, default: RecipeDifficulty.EASY })
  difficulty!: RecipeDifficulty;

  @Column({ name: 'total_time_min', type: 'int' })
  totalTimeMin!: number;

  @Column({ type: 'int', default: 1 })
  servings!: number;

  @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingAvg!: number;

  @Column({ name: 'dietary_tags_json', type: 'json', nullable: true })
  dietaryTagsJson?: string[] | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'author_id', type: 'int' })
  authorId!: number;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId?: number | null;

  @ManyToOne(() => User, (user) => user.recipes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @OneToMany(() => RecipeStep, (step) => step.recipe, { cascade: false })
  steps?: RecipeStep[];

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, { cascade: false })
  recipeIngredients?: RecipeIngredient[];

  @OneToMany(() => UserFavoriteRecipe, (favorite) => favorite.recipe, { cascade: false })
  favorites?: UserFavoriteRecipe[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}