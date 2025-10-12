// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EntitiesModule } from 'src/BusinessEntity/entities.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [TenantModule, EntitiesModule], // 👈 Solo necesitamos TenantModule ahora
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }