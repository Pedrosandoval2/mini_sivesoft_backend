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
import { ProductsModule } from './products/products.module';

// Módulo raíz de la aplicación que importa y configura todos los módulos necesarios para la aplicación NestJS
@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Módulos de la aplicación importados
    TenantModule,
    UsersModule,
    AuthModule,
    WarehousesModule,
    InventorySheetsModule,
    EntitiesModule,
    ProductsModule
  ],
  // Controladores de la aplicación
  controllers: [AppController],
  // Proveedores de la aplicación
  providers: [AppService],
})
export class AppModule { }
