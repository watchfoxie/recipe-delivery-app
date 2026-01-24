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
import { User } from '../../users/entities/user.entity';

@Entity('recipe_comment')
@Index('idx_recipe_comment_recipe_created', ['recipeId', 'createdAt'])
@Index('idx_recipe_comment_author', ['authorId'])
export class Comment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'recipe_id', type: 'int' })
  recipeId!: number;

  @Column({ name: 'author_id', type: 'int' })
  authorId!: number;

  @Column({ type: 'text' })
  text!: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
