import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { IsPublic } from '../../common/decorators/is-public.decorator';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOkResponse({ description: 'User logged in successfully' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @IsPublic()
  @Post('register')
  @ApiOkResponse({ description: 'User registered successfully' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
