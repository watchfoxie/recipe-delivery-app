import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { translateMessage } from '../../common/utils/i18n.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly i18n: I18nService) {}

  @Post()
  @ApiStandardResponses(UserResponseDto)
  async create(@Body() dto: CreateUserDto) {
    const entity = await this.usersService.create(dto);
    return {
      message: await this.translate('messages.SUCCESS.USER_CREATED'),
      data: plainToInstance(UserResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  @ApiStandardResponses(UserResponseDto, { isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: await this.translate('messages.SUCCESS.USER_LIST'),
      data: users.map((user) =>
        plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
      ),
    };
  }

  @Get(':id')
  @ApiStandardResponses(UserResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return {
      message: await this.translate('messages.SUCCESS.USER_FOUND'),
      data: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  @ApiStandardResponses(UserResponseDto)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return {
      message: await this.translate('messages.SUCCESS.USER_UPDATED'),
      data: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @ApiStandardResponses()
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return {
      message: await this.translate('messages.SUCCESS.USER_DELETED'),
      data: null,
    };
  }

  private translate(key: string): Promise<string> {
    return translateMessage(this.i18n, key);
  }
}