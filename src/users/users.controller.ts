import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantId } from '../tenant/decorator/tenant-id.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Crear nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    create(@Body() createUserDto: CreateUserDto, @TenantId() tenantId: string) {
        return this.usersService.create(createUserDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios' })
    findAll(@TenantId() tenantId: string, req: Request) {
        return this.usersService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado' })
    findOne(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.usersService.findOne(id, tenantId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Actualizar usuario' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado' })
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @TenantId() tenantId: string) {
        return this.usersService.update(id, updateUserDto, tenantId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Eliminar usuario' })
    @ApiResponse({ status: 200, description: 'Usuario eliminado' })
    remove(@Param('id') id: number, @TenantId() tenantId: string) {
        return this.usersService.remove(id, tenantId);
    }
}