import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';


@Injectable()
export class AuthService {
    constructor(
        readonly usersService: UsersService,
        readonly jwtService: JwtService,
        readonly configService: ConfigService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        try {
            const user = await this.usersService.findByUsernameAcrossTenants(username);
            if (user && (await bcrypt.compare(password, user.password))) {
                const { password, ...result } = user;
                return result;
            }
            return null;
        } catch (error) {
            throw new Error(`Error validating user with username ${username}: ${error.message}`);
        }
    }

    async login(user: any) {
        const existingUser = await this.usersService.findByUsernameAcrossTenants(user.username);
        if (!existingUser) {
            throw new Error('Invalid credentials');
        }

        const verifyPassword = await bcrypt.compare(user.password, existingUser?.password || '');

        if (!verifyPassword) {
            throw new Error('Invalid credentials');
        }

        // Convertir tenantIds a array si viene como string (de inserts manuales)
        let tenantIds: string[] = existingUser.tenantIds;
        if (typeof tenantIds === 'string') {
            tenantIds = (tenantIds as string).split(',').map(t => t.trim());
        }

        // Validar que el usuario tenga al menos un tenant
        if (!tenantIds || tenantIds.length === 0) {
            throw new Error('Usuario no tiene tenants asignados');
        }

        try {
            const payload = {
                username: existingUser.username,
                id: existingUser.id,
                role: existingUser.role,
                nameEntity: existingUser.entityRelation?.name || null,
                tenantIds: tenantIds, // Array de tenants
                tenantId: tenantIds[0], // Tenant por defecto (el primero)
            };

            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            });

            return {
                token: accessToken,
                refreshToken,
                user: payload
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener los productos',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Para refresh token, usamos el tenantId del payload actual
            const user = await this.usersService.findOne(payload.sub, payload.tenantId);
            if (!user) {
                throw new Error('User not found');
            }

            const newPayload = {
                username: user.username,
                sub: user.id,
                role: user.role,
                tenantIds: user.tenantIds,
                tenantId: payload.tenantId, // Mantener el tenant actual
            };

            return {
                token: this.jwtService.sign(newPayload),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener los productos',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async switchTenant(userId: number, tenantId: string, currentTenantId: string) {
        try {
            // Primero intentamos buscar en el tenant actual, luego en el nuevo tenant
            let user = await this.usersService.findOne(userId, currentTenantId);
            console.log("🚀 ~ AuthService ~ switchTenant ~ user:", user)
            if (!user) {
                user = await this.usersService.findOne(userId, tenantId);
                console.log("🚀 ~ AuthService ~ if:", user)
            }

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar que el tenant esté en la lista de tenants del usuario
            if (!user?.tenantIds?.includes(tenantId)) {
                throw new Error(`Usuario no tiene acceso al tenant ${tenantId}`);
            }

            // Generar nuevo token con el tenant seleccionado
            const payload = {
                username: user.username,
                id: user.id,
                role: user.role,
                nameEntity: user.entityRelation?.name || null,
                tenantIds: user.tenantIds,
                tenantId: tenantId, // El nuevo tenant activo
            };

            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            });

            return {
                token: accessToken,
                refreshToken,
                user: payload,
                message: `Cambiado a tenant: ${tenantId}`,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener los productos',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}