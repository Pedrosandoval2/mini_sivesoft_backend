
import { Module } from '@nestjs/common';
import { InventorySheetsService } from './inventory-sheets.service';
import { InventorySheetsController } from './inventory-sheets.controller';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { UsersModule } from 'src/users/users.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [TenantModule, WarehousesModule, UsersModule],
    controllers: [InventorySheetsController],
    providers: [InventorySheetsService],
    exports: [InventorySheetsService],
})
export class InventorySheetsModule { }