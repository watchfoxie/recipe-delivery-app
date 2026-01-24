import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeCategory } from './entities/recipe-category.entity';
import { RecipeCategoriesController } from './recipe-categories.controller';
import { RecipeCategoriesService } from './recipe-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeCategory])],
  controllers: [RecipeCategoriesController],
  providers: [RecipeCategoriesService],
  exports: [RecipeCategoriesService],
})
export class RecipeCategoriesModule {}
