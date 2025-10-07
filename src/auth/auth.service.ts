// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
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
            const user = await this.usersService.findByUsername(username);
            console.log("🚀 ~ AuthService ~ validateUser ~ user:", user)
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
        const existingUser = await this.usersService.findByUsername(user.username);
        console.log("🚀 ~ AuthService ~ login ~ existingUser:", existingUser)
        if (!existingUser) {
            throw new Error('User not found');
        }

        try {
            const payload = {
                username: existingUser.username,
                id: existingUser.id,
                role: existingUser.role,
                nameEntity: existingUser.entityRelation?.name || null,
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
            throw new Error(`Error during login for user ${user.username}: ${error.message}`);
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                throw new Error('User not found');
            }

            const newPayload = {
                username: user.username,
                sub: user.id,
                role: user.role,
            };

            return {
                token: this.jwtService.sign(newPayload),
            };
        } catch (error) {
            throw new Error(`Error refreshing token: ${error.message}`);
        }
    }
}