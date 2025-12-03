import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
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

  @Get('verify-access-token')
  @ApiOkResponse({ description: 'Token is valid' })
  verifyAccessToken() {
    // The JwtAuthGuard verifies the token before this method is called.
    // If the token is invalid or missing, the guard throws a 401 Unauthorized error.
    // If execution reaches here, the token is valid.
    return true;
  }
}
