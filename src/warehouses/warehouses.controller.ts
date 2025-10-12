// src/warehouses/warehouses.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { TenantId } from '../tenant/decorator/tenant-id.decorator';

@ApiTags('warehouses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('warehouses')
export class WarehousesController {
    constructor(private readonly warehousesService: WarehousesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Crear nuevo almacén' })
    @ApiResponse({ status: 201, description: 'Almacén creado exitosamente' })
    create(@Body() createWarehouseDto: CreateWarehouseDto, @TenantId() tenantId: string) {
        return this.warehousesService.create(createWarehouseDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener almacenes' })
    @ApiResponse({ status: 200, description: 'Lista de almacenes' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    findAll(@Query('query') query: string, @TenantId() tenantId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
        return this.warehousesService.findAll(page, limit, query, tenantId);
    }

    @Get('by-user')
    @ApiOperation({ summary: 'Obtener almacenes por usuario' })
    @ApiResponse({ status: 200, description: 'Lista de almacenes' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    findByUser(@TenantId() tenantId: string) {
        return this.warehousesService.findByUser(tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener almacén por ID' })
    @ApiResponse({ status: 200, description: 'Almacén encontrado' })
    findOne(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.warehousesService.findOne(id, tenantId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Actualizar almacén' })
    @ApiResponse({ status: 200, description: 'Almacén actualizado' })
    update(@Param('id') id: number, @Body() updateWarehouseDto: UpdateWarehouseDto, @TenantId() tenantId: string) {
        return this.warehousesService.update(id, updateWarehouseDto, tenantId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Eliminar almacén' })
    @ApiResponse({ status: 200, description: 'Almacén eliminado' })
    remove(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.warehousesService.remove(id, tenantId);
    }
}