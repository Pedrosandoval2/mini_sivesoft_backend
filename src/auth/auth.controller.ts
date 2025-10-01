// src/auth/auth.controller.ts
import { Controller, Request, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        readonly authService: AuthService,
    ) { }

    @Post('login')
    @ApiOperation({ summary: 'Login de usuario' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Request() req, @Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Renovar token' })
    @ApiResponse({ status: 200, description: 'Token renovado' })
    @ApiResponse({ status: 401, description: 'Refresh token inválido' })
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

}