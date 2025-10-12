import { Controller, Get, Post, Body, Param, UseGuards, Query, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InventorySheetsService } from './inventory-sheets.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateInventoryDto } from './dto/create-inventory-details';
import { TenantId } from '../tenant/decorator/tenant-id.decorator';

@ApiTags('inventory-sheets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('inventory-sheets')
export class InventorySheetsController {
    constructor(private readonly inventorySheetsService: InventorySheetsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva hoja de inventario' })
    @ApiResponse({ status: 201, description: 'Hoja de inventario creada exitosamente' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    create(@Body() createInventorySheetDto: CreateInventoryDto, @Request() req, @TenantId() tenantId: string) {
        return this.inventorySheetsService.create(createInventorySheetDto, req.user.userId, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener hojas de inventario' })
    @ApiResponse({ status: 200, description: 'Lista de hojas de inventario' })
    @ApiQuery({ name: 'dateFrom', required: false })
    @ApiQuery({ name: 'dateTo', required: false })
    @ApiQuery({ name: 'query', required: false })
    @ApiQuery({ name: 'warehouseId', required: false })
    @ApiQuery({ name: 'entity', required: false })
    @ApiQuery({ name: 'state', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    findAll(@Query() filters: any, @TenantId() tenantId: string) {
        return this.inventorySheetsService.findAll({ 
            dateFrom: filters.dateFrom, 
            dateTo: filters.dateTo, 
            warehouseId: filters.warehouseId, 
            state: filters.state, 
            page: filters.page || 1, 
            limit: filters.limit || 10, 
            query: filters.query, 
            entity: filters.entity,
            tenantId 
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener hoja de inventario por ID' })
    @ApiResponse({ status: 200, description: 'Hoja de inventario encontrada' })
    findOne(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.inventorySheetsService.findOne(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar hoja de inventario' })
    @ApiResponse({ status: 200, description: 'Hoja de inventario actualizada' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    update(@Param('id') id: number, @Body() updateInventorySheetDto: CreateInventoryDto, @Request() req, @TenantId() tenantId: string) {
        return this.inventorySheetsService.update(id, updateInventorySheetDto, req.user.userId, tenantId);
    }

    // @Delete(':id')
    // @ApiOperation({ summary: 'Eliminar hoja de inventario' })
    // @ApiResponse({ status: 200, description: 'Hoja de inventario eliminada' })
    // @Roles(UserRole.ADMIN, UserRole.MANAGER)
    // remove(@Param('id') id: string, @TenantId() tenantId: string) {
    //     return this.inventorySheetsService.remove(id, tenantId);
    // }
}