import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { ApiStandardResponses } from '../../common/swagger/swagger-responses.util';
import { translateMessage } from '../../common/utils/i18n.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly i18n: I18nService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiStandardResponses(LoginResponseDto)
  async login(@Body() dto: LoginDto) {
    const result = await this.usersService.login(dto.email, dto.password);

    const response = plainToInstance(
      LoginResponseDto,
      {
        token: result.token,
        user: plainToInstance(UserResponseDto, result.user, {
          excludeExtraneousValues: true,
        }),
      },
      { excludeExtraneousValues: true },
    );

    return {
      message: await this.translate('auth.SUCCESS.LOGIN'),
      data: response,
    };
  }

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obținere profil utilizator curent' })
  @ApiStandardResponses(UserResponseDto)
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.usersService.getProfile(user.id);
    return {
      message: await this.translate('messages.SUCCESS.USER_FOUND'),
      data: plainToInstance(UserResponseDto, profile, { excludeExtraneousValues: true }),
    };
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizare profil utilizator curent' })
  @ApiStandardResponses(UserResponseDto)
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return {
      message: await this.translate('messages.SUCCESS.USER_UPDATED'),
      data: plainToInstance(UserResponseDto, updated, { excludeExtraneousValues: true }),
    };
  }

  @Put('me/password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Schimbare parolă utilizator curent' })
  @ApiStandardResponses(null)
  async changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(user.id, dto);
    return {
      message: await this.translate('auth.SUCCESS.PASSWORD_CHANGED'),
      data: null,
    };
  }

  @Patch('me/theme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizare temă utilizator curent' })
  @ApiStandardResponses(UserResponseDto)
  async updateTheme(@CurrentUser() user: User, @Body() dto: UpdateThemeDto) {
    const updated = await this.usersService.updateTheme(user.id, dto.theme);
    return {
      message: await this.translate('messages.SUCCESS.USER_UPDATED'),
      data: plainToInstance(UserResponseDto, updated, { excludeExtraneousValues: true }),
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiStandardResponses(UserResponseDto)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return {
      message: await this.translate('messages.SUCCESS.USER_UPDATED'),
      data: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
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