import { Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [TenantModule],
    controllers: [WarehousesController],
    providers: [WarehousesService],
    exports: [WarehousesService],
})
export class WarehousesModule { }