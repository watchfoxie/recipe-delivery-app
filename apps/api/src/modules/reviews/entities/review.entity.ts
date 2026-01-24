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
import { Recipe } from '../../recipes/entities/recipe.entity';
import { User } from '../../users/entities/user.entity';

@Entity('review')
@Index('uq_review_user_recipe', ['userId', 'recipeId'], { unique: true })
@Index('idx_review_recipe', ['recipeId'])
@Index('idx_review_user', ['userId'])
@Index('idx_review_rating', ['rating'])
export class Review {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'recipe_id', type: 'int' })
  recipeId!: number;

  @Column({ type: 'tinyint', unsigned: true })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Recipe, (recipe) => recipe.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
