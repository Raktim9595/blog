import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() userData: AuthDto) {
    return this.authService.signup(userData);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  sign(@Body() userData: AuthDto) {
    return this.authService.signin(userData);
  }
}
