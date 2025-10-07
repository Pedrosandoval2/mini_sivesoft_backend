// src/warehouses/warehouses.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
    constructor(
        @InjectRepository(Warehouse)
        readonly warehousesRepository: Repository<Warehouse>,
    ) { }

    async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
        try {
            const [lastWarehouse] = await this.warehousesRepository.find({
                order: { serieWarehouse: 'DESC' },
                take: 1,
            });

            const nextNumber = (lastWarehouse?.serieWarehouse ?? 0) + 1;

            const warehouse = this.warehousesRepository.create({
                ...createWarehouseDto,
                serieWarehouse: nextNumber
            });
            return await this.warehousesRepository.save(warehouse);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al crear el almacén',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll(page: number, limit: number, query: string): Promise<{ data: Warehouse[]; total?: number; page?: number; limit?: number; totalPages?: number }> {
        try {
            const qb = this.warehousesRepository.createQueryBuilder('warehouse')
                .skip((page - 1) * limit)
                .take(limit);

            if (query) {
                qb.where('LOWER(warehouse.name) LIKE :query', { query: `%${query.toLowerCase()}%` });
            }

            const [data, total] = await qb.getManyAndCount();
            return {
                data,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener los almacenes',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findByUser() {
        try {
            const qb = this.warehousesRepository.createQueryBuilder('warehouse')
                .leftJoin('warehouse.users', 'user')
                .where(qb => {
                    return 'warehouse.id IN ' +
                        qb.subQuery()
                            .select('wu.warehouseId')
                            .from('users_warehouses', 'wu')
                            .getQuery();
                })


            return await qb.getMany();
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener los almacenes por usuarios',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<Warehouse | null> {
        try {

            await this.validateWarehouseExists(id);

            return await this.warehousesRepository.findOne({
                where: { id },
                relations: ['inventorySheets']
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                `Error finding warehouse with id ${id}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse | null> {
        try {

            await this.validateWarehouseExists(id);

            await this.warehousesRepository.update(id, updateWarehouseDto);
            return await this.findOne(id);
        } catch (error) {
            throw new Error(`Error updating warehouse with id ${id}: ${error.message}`);
        }
    }

    private async validateWarehouseExists(id: number): Promise<void> {
        const warehouse = await this.warehousesRepository.findOne({ where: { id } });
        if (!warehouse) {
            throw new HttpException('Almacén no encontrado', HttpStatus.NOT_FOUND);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            await this.validateWarehouseExists(id);
            await this.warehousesRepository.delete(id);
        } catch (error) {
            throw new Error(`Error removing warehouse with id ${id}: ${error.message}`);
        }
    }
}