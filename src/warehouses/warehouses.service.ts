// src/warehouses/warehouses.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { TenantConnectionService } from '../tenant/tenant-connection.service';

@Injectable()
export class WarehousesService {
    constructor(
        private readonly tenantConnectionService: TenantConnectionService,
    ) { }

    async create(createWarehouseDto: CreateWarehouseDto, tenantId: string): Promise<Warehouse> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            const [lastWarehouse] = await warehousesRepository.find({
                order: { serieWarehouse: 'DESC' },
                take: 1,
            });

            const nextNumber = (lastWarehouse?.serieWarehouse ?? 0) + 1;

            const warehouse = warehousesRepository.create({
                ...createWarehouseDto,
                serieWarehouse: nextNumber
            });
            return await warehousesRepository.save(warehouse);
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

    async findAll(page: number, limit: number, query: string, tenantId: string): Promise<{ data: Warehouse[]; total?: number; page?: number; limit?: number; totalPages?: number }> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            const qb = warehousesRepository.createQueryBuilder('warehouse')
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

    async findByUser(tenantId: string) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            const qb = warehousesRepository.createQueryBuilder('warehouse')
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

    async findOne(id: number, tenantId: string): Promise<Warehouse | null> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            await this.validateWarehouseExists(id, tenantId);

            return await warehousesRepository.findOne({
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

    async update(id: number, updateWarehouseDto: UpdateWarehouseDto, tenantId: string): Promise<Warehouse | null> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            await this.validateWarehouseExists(id, tenantId);

            await warehousesRepository.update(id, updateWarehouseDto);
            return await this.findOne(id, tenantId);
        } catch (error) {
            throw new Error(`Error updating warehouse with id ${id}: ${error.message}`);
        }
    }

    private async validateWarehouseExists(id: number, tenantId: string): Promise<void> {
        const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
        const warehousesRepository = connection.getRepository(Warehouse);
        
        const warehouse = await warehousesRepository.findOne({ where: { id } });
        if (!warehouse) {
            throw new HttpException('Almacén no encontrado', HttpStatus.NOT_FOUND);
        }
    }

    async remove(id: number, tenantId: string): Promise<void> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            await this.validateWarehouseExists(id, tenantId);
            await warehousesRepository.delete(id);
        } catch (error) {
            throw new Error(`Error removing warehouse with id ${id}: ${error.message}`);
        }
    }
}