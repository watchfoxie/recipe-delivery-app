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
import type { Recipe } from '../../recipes/entities/recipe.entity';
import type { UserFavoriteRecipe } from '../../favorites/entities/user-favorite-recipe.entity';
import type { Comment } from '../../recipes/entities/recipe-comment.entity';
import type { Review } from '../../reviews/entities/review.entity';

export enum UserTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

@Entity('user')
@Index('uq_user_email', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 191, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 191 })
  displayName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string | null;

  @Column({ type: 'enum', enum: UserTheme, default: UserTheme.LIGHT })
  theme!: UserTheme;

  @Column({ name: 'preferences_json', type: 'json', nullable: true })
  preferencesJson?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;

  @OneToMany('Recipe', 'author')
  recipes?: Recipe[];

  @OneToMany('UserFavoriteRecipe', 'user')
  favorites?: UserFavoriteRecipe[];

  @OneToMany('Comment', 'author')
  comments?: Comment[];

  @OneToMany('Review', 'user')
  reviews?: Review[];
}