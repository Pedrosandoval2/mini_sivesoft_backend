import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InventorySheetsService } from './inventory-sheets.service';
import { CreateInventorySheetDto } from './dto/create-inventory-sheet.dto';
import { UpdateInventorySheetDto } from './dto/update-inventory-sheet.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

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
    create(@Body() createInventorySheetDto: CreateInventorySheetDto, @Request() req) {
        return this.inventorySheetsService.create(createInventorySheetDto, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener hojas de inventario' })
    @ApiResponse({ status: 200, description: 'Lista de hojas de inventario' })
    @ApiQuery({ name: 'dateFrom', required: false })
    @ApiQuery({ name: 'dateTo', required: false })
    @ApiQuery({ name: 'warehouseId', required: false })
    findAll(
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
        @Query('warehouseId') warehouseId?: string,
    ) {
        return this.inventorySheetsService.findAll({ dateFrom, dateTo, warehouseId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener hoja de inventario por ID' })
    @ApiResponse({ status: 200, description: 'Hoja de inventario encontrada' })
    findOne(@Param('id') id: string) {
        return this.inventorySheetsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar hoja de inventario' })
    @ApiResponse({ status: 200, description: 'Hoja de inventario actualizada' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    update(@Param('id') id: string, @Body() updateInventorySheetDto: UpdateInventorySheetDto) {
        return this.inventorySheetsService.update(id, updateInventorySheetDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar hoja de inventario' })
    @ApiResponse({ status: 200, description: 'Hoja de inventario eliminada' })
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    remove(@Param('id') id: string) {
        return this.inventorySheetsService.remove(id);
    }
}