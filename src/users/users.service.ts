// src/users/users.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import { EntitiesService } from '../BusinessEntity/entities.service';
import { BusinessEntity } from 'src/BusinessEntity/entities/businessEntity.entity';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        readonly usersRepository: Repository<User>,
        @InjectRepository(Warehouse)
        readonly warehousesRepository: Repository<Warehouse>,
        readonly EntitiesService: EntitiesService,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            // Verificar usuario existente
            const existingUser = await this.usersRepository.findOne({
                where: { username: createUserDto.username },
            });

            if (existingUser) {
                throw new HttpException('El nombre de usuario ya está registrado', HttpStatus.CONFLICT);
            }

            let entityRelation: BusinessEntity | undefined;

            if (createUserDto.entityRelationId) {
                const entityRelationResult = await this.EntitiesService.findOne(createUserDto.entityRelationId);

                if (!entityRelationResult) {
                    throw new HttpException('Entidad de negocio no encontrada', HttpStatus.NOT_FOUND);
                }

                if (entityRelationResult.user) {
                    throw new HttpException('Esta entidad ya está asignada a otro usuario', HttpStatus.CONFLICT);
                }

                entityRelation = entityRelationResult;
            }

            const warehouses = await this.warehousesRepository.findBy({
                id: In(createUserDto.warehouseIds || []),
            });

            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

            const user = this.usersRepository.create({
                username: createUserDto.username,
                role: createUserDto.role,
                password: hashedPassword,
                warehouses,
                entityRelation,
            });

            return await this.usersRepository.save(user);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al crear el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async addWarehousesToUser(userId: number, warehouseIds: number[]): Promise<User> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                relations: ['warehouses'],
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            const warehouses = await this.warehousesRepository.findBy({
                id: In(warehouseIds)
            });

            if (warehouses.length !== warehouseIds.length) {
                throw new HttpException('Algunos almacenes no fueron encontrados', HttpStatus.NOT_FOUND);
            }

            user.warehouses.push(...warehouses);
            return await this.usersRepository.save(user);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al agregar almacenes al usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll(): Promise<User[]> {
        try {
            return await this.usersRepository.find({
                relations: ['warehouses', 'entityRelation'],
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener los usuarios',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<User> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                relations: ['warehouses', 'entityRelation'],
                select: ['id', 'username', 'role']
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al buscar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        try {
            return await this.usersRepository.findOne({
                where: { username },
                relations: ['entityRelation', 'warehouses'],
            });
        } catch (error) {
            // Log the error for debugging purposes
            console.error('Error in findByUsername:', error);
            throw new HttpException(
                'Error interno al buscar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                relations: ['warehouses', 'entityRelation'],
            });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            await this.ensureUsernameIsUnique(updateUserDto, user);
            await this.updateWarehousesIfNeeded(updateUserDto, user);
            await this.updateEntityRelationIfNeeded(updateUserDto, user);
            await this.updatePasswordIfNeeded(updateUserDto);

            const result = this.usersRepository.merge(user, updateUserDto);
            return await this.usersRepository.save(result);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al actualizar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async ensureUsernameIsUnique(updateUserDto: UpdateUserDto, user: User): Promise<void> {
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const duplicateUser = await this.usersRepository.findOne({
                where: { username: updateUserDto.username },
            });

            if (duplicateUser) {
                throw new HttpException('El nombre de usuario ya está registrado', HttpStatus.CONFLICT);
            }
        }
    }

    private async updateWarehousesIfNeeded(updateUserDto: UpdateUserDto, user: User): Promise<void> {
        if (updateUserDto.warehouseIds) {
            const warehouses = await this.warehousesRepository.findBy({
                id: In(updateUserDto.warehouseIds),
            });
            user.warehouses = warehouses;
            delete updateUserDto.warehouseIds;
        }
    }

    private async updateEntityRelationIfNeeded(updateUserDto: UpdateUserDto, user: User): Promise<void> {
        if (updateUserDto.entityRelationId) {
            const entityRelationResult = await this.EntitiesService.findOne(updateUserDto.entityRelationId);

            if (!entityRelationResult) {
                throw new HttpException('Entidad de negocio no encontrada', HttpStatus.NOT_FOUND);
            }

            // Verificar si la entidad ya está asignada a otro user
            if (entityRelationResult.user && entityRelationResult.user.id !== user.id) {
                throw new HttpException('Esta entidad ya está asignada a otro usuario', HttpStatus.CONFLICT);
            }

            // Limpiar relación previa si existe
            if (user.entityRelation && user.entityRelation.id !== entityRelationResult.id) {
                user.entityRelation.user = null;
            }

            user.entityRelation = entityRelationResult;
            delete updateUserDto.entityRelationId;
        }
    }

    private async updatePasswordIfNeeded(updateUserDto: UpdateUserDto): Promise<void> {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const user = await this.usersRepository.findOne({ where: { id } });

            if (!user) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            await this.usersRepository.delete(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al eliminar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}