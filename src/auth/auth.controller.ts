// src/auth/auth.controller.ts
import { Controller, Request, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';

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

    @Post('switch-tenant')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar de tenant/empresa' })
    @ApiResponse({ status: 200, description: 'Tenant cambiado exitosamente' })
    @ApiResponse({ status: 400, description: 'Tenant no válido para este usuario' })
    async switchTenant(@Request() req, @Body() switchTenantDto: SwitchTenantDto) {
        return this.authService.switchTenant(req.user.userId, switchTenantDto.tenantId, req.user.tenantId);
    }

}