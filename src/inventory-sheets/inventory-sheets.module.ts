
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventorySheetsService } from './inventory-sheets.service';
import { InventorySheetsController } from './inventory-sheets.controller';
import { InventorySheetDetail } from './entities/inventory-sheet-detail.entity';
import { InventorySheet } from './entities/inventiory-sheet.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([InventorySheet, InventorySheetDetail]), WarehousesModule, UsersModule],
    controllers: [InventorySheetsController],
    providers: [InventorySheetsService],
    exports: [InventorySheetsService],
})
export class InventorySheetsModule { }