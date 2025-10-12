import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantId } from '../tenant/decorator/tenant-id.decorator';

@ApiTags('entities')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('entities')
export class EntitiesController {
    constructor(private readonly entitiesService: EntitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva entidad' })
    @ApiResponse({ status: 201, description: 'Entidad creada exitosamente' })
    create(@Body() createEntityDto: CreateEntityDto, @TenantId() tenantId: string) {
        return this.entitiesService.create(createEntityDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las entidades' })
    @ApiResponse({ status: 200, description: 'Lista de entidades' })
    findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('query') query: string, @TenantId() tenantId: string) {
        return this.entitiesService.findAll({ page, limit, query, tenantId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener entidad por ID' })
    @ApiResponse({ status: 200, description: 'Entidad encontrada' })
    findOne(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.entitiesService.findOne(id, tenantId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar entidad' })
    @ApiResponse({ status: 200, description: 'Entidad actualizada' })
    update(@Param('id') id: number, @Body() updateEntityDto: UpdateEntityDto, @TenantId() tenantId: string) {
        return this.entitiesService.update(id, updateEntityDto, tenantId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar entidad' })
    @ApiResponse({ status: 200, description: 'Entidad eliminada' })
    remove(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.entitiesService.remove(id, tenantId);
    }
}