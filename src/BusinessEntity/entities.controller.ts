import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('entities')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('entities')
export class EntitiesController {
    constructor(private readonly entitiesService: EntitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva entidad' })
    @ApiResponse({ status: 201, description: 'Entidad creada exitosamente' })
    create(@Body() createEntityDto: CreateEntityDto) {
        return this.entitiesService.create(createEntityDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las entidades' })
    @ApiResponse({ status: 200, description: 'Lista de entidades' })
    findAll() {
        return this.entitiesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener entidad por ID' })
    @ApiResponse({ status: 200, description: 'Entidad encontrada' })
    findOne(@Param('id') id: string) {
        return this.entitiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar entidad' })
    @ApiResponse({ status: 200, description: 'Entidad actualizada' })
    update(@Param('id') id: string, @Body() updateEntityDto: UpdateEntityDto) {
        return this.entitiesService.update(id, updateEntityDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar entidad' })
    @ApiResponse({ status: 200, description: 'Entidad eliminada' })
    remove(@Param('id') id: string) {
        return this.entitiesService.remove(id);
    }
}