import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventorySheetsModule } from './inventory-sheets/inventory-sheets.module';
import { EntitiesModule } from './BusinessEntity/entities.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TenantModule, // 👈 Agregamos el módulo de tenant
    UsersModule, 
    AuthModule, 
    WarehousesModule, 
    InventorySheetsModule, 
    EntitiesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
