import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { UsersModule } from '../users/users.module';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeStep } from './entities/recipe-step.entity';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Comment } from './entities/recipe-comment.entity';
import { CommentsService } from './comments.service';
import { RecipeCommentsController } from './recipe-comments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, RecipeStep, RecipeIngredient, Comment]),
    UsersModule,
    IngredientsModule,
  ],
  controllers: [RecipesController, RecipeCommentsController],
  providers: [RecipesService, CommentsService],
})
export class RecipesModule {}