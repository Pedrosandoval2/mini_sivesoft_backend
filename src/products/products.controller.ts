import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TenantId } from '../tenant/decorator/tenant-id.decorator';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Crear nuevo producto' })
    @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
    @ApiResponse({ status: 409, description: 'Ya existe un producto con ese nombre y unidad, o código de barras' })
    create(@Body() createProductDto: CreateProductDto, @TenantId() tenantId: string) {
        return this.productsService.create(createProductDto, tenantId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    @ApiOperation({ summary: 'Obtener productos' })
    @ApiResponse({ status: 200, description: 'Lista de productos' })
    @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página' })
    @ApiQuery({ name: 'query', required: false, description: 'Búsqueda por nombre o código de barras' })
    findAll(
        @Query('query') query: string,
        @TenantId() tenantId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        return this.productsService.findAll({ page, limit, query, tenantId });
    }

    @Get('barcode')
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    @ApiOperation({ summary: 'Obtener producto por barcode' })
    @ApiResponse({ status: 200, description: 'Producto-barcode encontrado' })
    @ApiResponse({ status: 404, description: 'Producto-barcode no encontrado' })
    findOneBarCode(
        @Query('barcode') barcode: string,
        @TenantId() tenantId: string
    ) {
        return this.productsService.findOneBarCode(barcode, tenantId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    @ApiOperation({ summary: 'Obtener producto por ID' })
    @ApiResponse({ status: 200, description: 'Producto encontrado' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    findOne(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.productsService.findOne(id, tenantId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Actualizar producto' })
    @ApiResponse({ status: 200, description: 'Producto actualizado' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    @ApiResponse({ status: 409, description: 'Ya existe otro producto con ese nombre y unidad, o código de barras' })
    update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto, @TenantId() tenantId: string) {
        return this.productsService.update(id, updateProductDto, tenantId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Eliminar producto' })
    @ApiResponse({ status: 200, description: 'Producto eliminado' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    remove(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.productsService.remove(id, tenantId);
    }
}
