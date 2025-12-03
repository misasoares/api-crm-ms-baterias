import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { IsPublic } from '../../common/decorators/is-public.decorator.js';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({ description: 'User logged in successfully' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return {
      message: 'Login realizado com sucesso',
      data,
    };
  }
  @IsPublic()
  @Post('register')
  @ApiOkResponse({ description: 'User registered successfully' })
  async register(@Body() createUserDto: CreateUserDto) {
    const data = await this.authService.register(createUserDto);
    return {
      message: 'Usuário registrado com sucesso',
      data,
    };
  }

  @Get('verify-access-token')
  @ApiOkResponse({ description: 'Token is valid' })
  verifyAccessToken() {
    // The JwtAuthGuard verifies the token before this method is called.
    // If the token is invalid or missing, the guard throws a 401 Unauthorized error.
    // If execution reaches here, the token is valid.
    return true;
  }
}
