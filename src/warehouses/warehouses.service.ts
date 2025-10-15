// src/warehouses/warehouses.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { TenantConnectionService } from '../tenant/tenant-connection.service';
import { BusinessEntity } from '../BusinessEntity/entities/businessEntity.entity';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class WarehousesService {
    constructor(
        private readonly tenantConnectionService: TenantConnectionService,
    ) { }

    async create(createWarehouseDto: CreateWarehouseDto, tenantId: string): Promise<Warehouse> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);

            // Validar que el propietario existe si se proporciona
            if (createWarehouseDto.ownerId) {
                const businessEntitiesRepository = connection.getRepository(BusinessEntity);
                const owner = await businessEntitiesRepository.findOne({
                    where: { id: createWarehouseDto.ownerId }
                });

                if (!owner) {
                    throw new HttpException(
                        'El propietario especificado no existe',
                        HttpStatus.NOT_FOUND,
                    );
                }
            }

            const [lastWarehouse] = await warehousesRepository.find({
                order: { serieWarehouse: 'DESC' },
                take: 1,
            });

            const nextNumber = (lastWarehouse?.serieWarehouse ?? 0) + 1;

            const warehouse = warehousesRepository.create({
                name: createWarehouseDto.name,
                address: createWarehouseDto.address,
                isActive: createWarehouseDto.isActive ?? true,
                serieWarehouse: nextNumber,
                ...(createWarehouseDto.ownerId && { owner: { id: createWarehouseDto.ownerId } as BusinessEntity }),
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
            console.log("🚀 ~ WarehousesService ~ findAll ~ warehousesRepository:", warehousesRepository)

            const qb = warehousesRepository.createQueryBuilder('warehouse')
                .leftJoinAndSelect('warehouse.owner', 'owner')
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

    async findByUser(tenantId: string, userRole: string) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const warehousesRepository = connection.getRepository(Warehouse);
            const qb = warehousesRepository.createQueryBuilder('warehouse')
            if (userRole === UserRole.USER) {
                qb
                    .leftJoinAndSelect('warehouse.owner', 'owner')
                    .leftJoin('warehouse.users', 'user')
                    .where(qb => {
                        return 'warehouse.id IN ' +
                            qb.subQuery()
                                .select('wu.warehouseId')
                                .from('users_warehouses', 'wu')
                                .getQuery();
                    })
            }

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
                relations: ['inventorySheets', 'owner']
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

            // Validar que el nuevo propietario existe si se está actualizando
            if (updateWarehouseDto.ownerId) {
                const businessEntitiesRepository = connection.getRepository(BusinessEntity);
                const owner = await businessEntitiesRepository.findOne({
                    where: { id: updateWarehouseDto.ownerId }
                });

                if (!owner) {
                    throw new HttpException(
                        'El propietario especificado no existe',
                        HttpStatus.NOT_FOUND,
                    );
                }
            }

            const warehouse = await warehousesRepository.findOne({
                where: { id },
                relations: ['owner']
            });

            if (!warehouse) {
                throw new HttpException('Almacén no encontrado', HttpStatus.NOT_FOUND);
            }

            if (updateWarehouseDto.name !== undefined) {
                warehouse.name = updateWarehouseDto.name;
            }

            if (updateWarehouseDto.address !== undefined) {
                warehouse.address = updateWarehouseDto.address;
            }

            if (updateWarehouseDto.isActive !== undefined) {
                warehouse.isActive = updateWarehouseDto.isActive;
            }

            if (updateWarehouseDto.ownerId !== undefined) {
                if (updateWarehouseDto.ownerId) {
                    warehouse.owner = { id: updateWarehouseDto.ownerId } as BusinessEntity;
                } else {
                    warehouse.owner = null as any;
                }
            }

            await warehousesRepository.save(warehouse);

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
            
            const warehouse = await warehousesRepository.findOne({
                where: { id },
                relations: ['users', 'inventorySheets']
            });

            if (!warehouse) {
                throw new HttpException('Almacén no encontrado', HttpStatus.NOT_FOUND);
            }

            if (warehouse.users && warehouse.users.length > 0) {
                throw new HttpException(
                    `No se puede eliminar el almacén porque tiene ${warehouse.users.length} usuario(s) asignado(s). Primero desasigne los usuarios.`,
                    HttpStatus.CONFLICT,
                );
            }

            if (warehouse.inventorySheets && warehouse.inventorySheets.length > 0) {
                throw new HttpException(
                    `No se puede eliminar el almacén porque tiene ${warehouse.inventorySheets.length} hoja(s) de inventario asociada(s). Primero elimine las hojas de inventario.`,
                    HttpStatus.CONFLICT,
                );
            }

            await warehousesRepository.delete(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al eliminar el almacén',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}