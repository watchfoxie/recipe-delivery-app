import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { translateMessage } from '../../common/utils/i18n.util';

@ApiTags('Recipe Comments')
@ApiBearerAuth('bearer')
@Controller('recipes')
export class RecipeCommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly i18n: I18nService,
  ) {}

  @Post(':recipeId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiStandardResponses(CommentResponseDto)
  async create(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: ActiveUser,
  ) {
    const comment = await this.commentsService.create(recipeId, user.userId, dto.text);
    return {
      message: await translateMessage(this.i18n, 'messages.SUCCESS.COMMENT_CREATED'),
      data: plainToInstance(CommentResponseDto, comment, { excludeExtraneousValues: true }),
    };
  }

  @Get(':recipeId/comments')
  @ApiStandardResponses(CommentResponseDto, { isPaginated: false })
  async list(@Param('recipeId', ParseIntPipe) recipeId: number) {
    const comments = await this.commentsService.listForRecipe(recipeId);
    return {
      message: await translateMessage(this.i18n, 'messages.SUCCESS.COMMENT_LIST'),
      data: comments.map((comment) =>
        plainToInstance(CommentResponseDto, comment, { excludeExtraneousValues: true }),
      ),
    };
  }
}
