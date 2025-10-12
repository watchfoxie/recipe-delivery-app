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
import { I18nContext, I18nService } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiStandardResponses(UserResponseDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly i18n: I18nService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const entity = await this.usersService.create(dto);
    return {
      message: await this.translate('messages.USERS.SUCCESS.CREATED'),
      data: plainToInstance(UserResponseDto, entity, { excludeExtraneousValues: true }),
    };
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: await this.translate('messages.USERS.SUCCESS.LISTED'),
      data: users.map((user) =>
        plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
      ),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return {
      message: await this.translate('messages.USERS.SUCCESS.FETCHED'),
      data: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return {
      message: await this.translate('messages.USERS.SUCCESS.UPDATED'),
      data: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return {
      message: await this.translate('messages.USERS.SUCCESS.DELETED'),
      data: null,
    };
  }

  private async translate(key: string): Promise<string> {
    const ctx = I18nContext.current();
    return (await this.i18n.translate(key as Parameters<I18nService['translate']>[0], {
      lang: ctx?.lang,
    })) as unknown as string;
  }
}