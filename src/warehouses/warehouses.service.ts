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
            const warehouse = this.warehousesRepository.create(createWarehouseDto);
            return await this.warehousesRepository.save(warehouse);
        } catch (error) {
            throw new Error(`Error creating warehouse: ${error.message}`);
        }
    }

    async findAll(): Promise<Warehouse[]> {
        try {
            const query = this.warehousesRepository.createQueryBuilder('warehouse')
            return await query.getMany();
        } catch (error) {
            throw new Error(`Error fetching warehouses: ${error.message}`);
        }
    }

    async findOne(id: string): Promise<Warehouse | null> {
        try {
            return await this.warehousesRepository.findOne({
                where: { id: Number(id) },
                relations: ['inventorySheets'],
            });
        } catch (error) {
            throw new Error(`Error finding warehouse with id ${id}: ${error.message}`);
        }
    }

    async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse | null> {
        try {
            await this.warehousesRepository.update(Number(id), updateWarehouseDto);
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