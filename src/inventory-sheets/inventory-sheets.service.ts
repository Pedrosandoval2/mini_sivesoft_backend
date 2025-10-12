import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InventorySheetDetail } from './entities/inventory-sheet-detail.entity';
import { InventorySheet } from './entities/inventiory-sheet.entity';
import { CreateInventoryDto } from './dto/create-inventory-details';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { UsersService } from 'src/users/users.service';
import { TenantConnectionService } from '../tenant/tenant-connection.service';

interface InventorySheetFilters {
    dateFrom?: string;
    dateTo?: string;
    warehouseId?: number;
    state?: string;
    query?: string;
    entity?: number;
    page: number;
    limit: number;
    tenantId: string;
}

@Injectable()
export class InventorySheetsService {
    constructor(
        private readonly tenantConnectionService: TenantConnectionService,
        readonly warehouseService: WarehousesService,
        readonly userService: UsersService
    ) { }

    async create(dto: CreateInventoryDto, userId: number, tenantId: string) {
        const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
        const sheetsRepository = connection.getRepository(InventorySheet);
        const detailsRepository = connection.getRepository(InventorySheetDetail);

        const user = await this.userService.findOne(userId, tenantId);

        await this.validateWarehouseExists(dto.sheet.warehouseId, tenantId);

        if (userId && !user) {
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        const sheet = sheetsRepository.create({
            ...dto.sheet,
            user: user ? { id: user.id } : undefined,
            warehouse: { id: dto.sheet.warehouseId },
        });


        const savedSheet = await sheetsRepository.save(sheet);

        if (dto.details?.length > 0) {
            const details = dto.details.map(d =>
                detailsRepository.create({
                    ...d,
                    inventorySheet: savedSheet,
                }),
            );

            await detailsRepository.save(details);
        }

        return {
            message: 'Hoja de inventario creada exitosamente',
        }
    }

    private async validateWarehouseExists(id: number, tenantId: string): Promise<void> {
        const warehouse = await this.warehouseService.findOne(id, tenantId);
        if (!warehouse) {
            throw new HttpException('Almacén no encontrado', HttpStatus.NOT_FOUND);
        }
    }

    private async validateInventorySheetExists(id: number, tenantId: string): Promise<void> {
        const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
        const sheetsRepository = connection.getRepository(InventorySheet);
        
        const sheet = await sheetsRepository.findOne({ where: { id } });
        if (!sheet) {
            throw new HttpException('Hoja de inventario no encontrada', HttpStatus.NOT_FOUND);
        }
    }

    async findAll(filters: InventorySheetFilters) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(filters.tenantId);
            const sheetsRepository = connection.getRepository(InventorySheet);

            const query = sheetsRepository.createQueryBuilder('sheet')
                .leftJoin('sheet.warehouse', 'warehouse')
                .addSelect(['warehouse.id', 'warehouse.name', 'warehouse.address', 'warehouse.isActive', 'warehouse.serieWarehouse'])
                .leftJoin('sheet.details', 'details')
                .addSelect(['details.id', 'details.productId', 'details.unit', 'details.price', 'details.quantity'])
                .leftJoin('sheet.user', 'user')
                .addSelect(['user.id', 'user.username', 'user.role', 'user.entityRelation'])
                .leftJoin('user.entityRelation', 'entityRelation')
                .addSelect([
                    'entityRelation.id',
                    'entityRelation.name',
                    'entityRelation.docType',
                    'entityRelation.docNumber',
                    'entityRelation.address',
                    'entityRelation.phone',
                ])
                .skip((filters.page - 1) * filters.limit)
                .take(filters.limit);

            if (filters.query) {
                query.where('user.username = :username', { username: `%${filters.query.toLowerCase()}%` })
                    .orWhere('LOWER(warehouse.name) LIKE :query', { query: `%${filters.query.toLowerCase()}%` })
                    .orWhere('LOWER(entityRelation.name) LIKE :query', { query: `%${filters.query.toLowerCase()}%` })
            }

            if (filters.warehouseId && filters.entity && filters.dateFrom && filters.dateTo) {
                query.orWhere('warehouse.id = :warehouseId', { warehouseId: filters.warehouseId })
                    .andWhere('entityRelation.id = :entityId', { entityId: filters.entity })
                    .andWhere('sheet.emissionDate >= :dateFrom', { dateFrom: filters.dateFrom })
                    .andWhere('sheet.emissionDate <= :dateTo', { dateTo: filters.dateTo });
            } else {
                if (filters.warehouseId) {
                    query.orWhere('warehouse.id = :warehouseId', { warehouseId: filters.warehouseId });
                }
                if (filters.entity) {
                    query.orWhere('entityRelation.id = :entityId', { entityId: filters.entity });
                }
            }

            if (filters.dateFrom) {
                query.andWhere('sheet.emissionDate >= :dateFrom', { dateFrom: filters.dateFrom });
            }
            if (filters.dateTo) {
                query.andWhere('sheet.emissionDate <= :dateTo', { dateTo: filters.dateTo });
            }

            if (filters.state) {
                query.andWhere('sheet.state = :state', { state: filters.state });
            }

            const [data, total] = await query.getManyAndCount();

            return {
                data,
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener las hojas de inventario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number, tenantId: string): Promise<InventorySheet | null> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const sheetsRepository = connection.getRepository(InventorySheet);

            await this.validateInventorySheetExists(id, tenantId);

            return sheetsRepository.createQueryBuilder('sheet')
                .leftJoin('sheet.warehouse', 'warehouse')
                .addSelect(['warehouse.id', 'warehouse.name', 'warehouse.address', 'warehouse.isActive'])
                .leftJoin('sheet.details', 'details')
                .addSelect(['details.id', 'details.productId', 'details.unit', 'details.price', 'details.quantity'])
                .leftJoin('sheet.user', 'user')
                .addSelect(['user.id', 'user.username', 'user.role'])
                .where('sheet.id = :id', { id })
                .getOne();
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al buscar la hoja de inventario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, dto: CreateInventoryDto, userId: number, tenantId: string) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const sheetsRepository = connection.getRepository(InventorySheet);
            const detailsRepository = connection.getRepository(InventorySheetDetail);

            if (!userId) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            const sheet = await sheetsRepository.findOne({
                where: { id },
                relations: ['details', 'warehouse'],
            });

            if (!sheet) {
                throw new HttpException('Hoja de inventario no encontrada', HttpStatus.NOT_FOUND);
            }

            await this.validateWarehouseExists(dto.sheet.warehouseId, tenantId);

            // Actualizar la hoja
            Object.assign(sheet, {
                ...dto.sheet,
                userId,
                warehouse: { id: dto.sheet.warehouseId },
            });

            const updatedSheet = await sheetsRepository.save(sheet);

            // Manejo de detalles
            if (dto.details?.length > 0) {
                // Borrar los detalles anteriores (opcional, depende de tu negocio)
                await detailsRepository.delete({ inventorySheet: { id } });

                // Crear los nuevos
                const details = dto.details.map((d) =>
                    detailsRepository.create({
                        ...d,
                        inventorySheet: updatedSheet,
                    }),
                );

                await detailsRepository.save(details);
            }

            return sheetsRepository.findOne({
                where: { id: updatedSheet.id },
                relations: ['warehouse', 'details'],
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al actualizar la hoja de inventario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: number, tenantId: string): Promise<void> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const sheetsRepository = connection.getRepository(InventorySheet);

            await this.validateInventorySheetExists(id, tenantId);
            await sheetsRepository.delete(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al eliminar la hoja de inventario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // async addDetail(sheetId: string, detailData: Partial<InventorySheetDetail>): Promise<InventorySheetDetail> {
    //     const detail = this.detailsRepository.create({
    //         ...detailData,
    //         inventorySheetId: Number(sheetId),
    //     });
    //     return this.detailsRepository.save(detail);
    // }
}