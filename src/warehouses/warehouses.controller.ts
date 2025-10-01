// src/warehouses/warehouses.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

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
    create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehousesService.create(createWarehouseDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener almacenes' })
    @ApiResponse({ status: 200, description: 'Lista de almacenes' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    findAll() {
        return this.warehousesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener almacén por ID' })
    @ApiResponse({ status: 200, description: 'Almacén encontrado' })
    findOne(@Param('id') id: string) {
        return this.warehousesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Actualizar almacén' })
    @ApiResponse({ status: 200, description: 'Almacén actualizado' })
    update(@Param('id') id: number, @Body() updateWarehouseDto: UpdateWarehouseDto) {
        return this.warehousesService.update(id, updateWarehouseDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Eliminar almacén' })
    @ApiResponse({ status: 200, description: 'Almacén eliminado' })
    remove(@Param('id') id: string) {
        return this.warehousesService.remove(id);
    }
}