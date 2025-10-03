// src/warehouses/warehouses.service.ts
import { Injectable } from '@nestjs/common';
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
            throw new Error(`Error creating warehouse: ${error.message}`);
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
            throw new Error(`Error fetching warehouses: ${error.message}`);
        }
    }

    async findOne(id: number): Promise<Warehouse | null> {
        try {
            return await this.warehousesRepository.findOne({
                where: { id },
                relations: ['inventorySheets'],
                select: ['id', 'name', 'address', 'isActive']
            });
        } catch (error) {
            throw new Error(`Error finding warehouse with id ${id}: ${error.message}`);
        }
    }

    async update(id: number, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse | null> {
        try {
            await this.warehousesRepository.update(id, updateWarehouseDto);
            return await this.findOne(id);
        } catch (error) {
            throw new Error(`Error updating warehouse with id ${id}: ${error.message}`);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.warehousesRepository.delete(Number(id));
        } catch (error) {
            throw new Error(`Error removing warehouse with id ${id}: ${error.message}`);
        }
    }
}