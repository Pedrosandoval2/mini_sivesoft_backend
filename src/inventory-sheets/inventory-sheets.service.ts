import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventorySheetDetail } from './entities/inventory-sheet-detail.entity';
import { InventorySheet } from './entities/inventiory-sheet.entity';
import { CreateInventoryDto } from './dto/create-inventory-details';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { UsersService } from 'src/users/users.service';

interface InventorySheetFilters {
    dateFrom?: string;
    dateTo?: string;
    warehouseId?: number;
    state?: string;
    query?: string;
    entity?: number;
    page: number;
    limit: number;
}

@Injectable()
export class InventorySheetsService {
    constructor(
        @InjectRepository(InventorySheet)
        readonly sheetsRepository: Repository<InventorySheet>,
        @InjectRepository(InventorySheetDetail)
        readonly detailsRepository: Repository<InventorySheetDetail>,
        readonly warehouseService: WarehousesService,
        readonly userService: UsersService
    ) { }

    async create(dto: CreateInventoryDto, userId: number) {

        const user = await this.userService.findOne(userId);

        this.validateWarehouseExists(dto.sheet.warehouseId);

        if (userId && !user) {
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        const sheet = this.sheetsRepository.create({
            ...dto.sheet,
            user: user ? { id: user.id } : undefined,
            warehouse: { id: dto.sheet.warehouseId },
        });


        const savedSheet = await this.sheetsRepository.save(sheet);

        if (dto.details?.length > 0) {
            const details = dto.details.map(d =>
                this.detailsRepository.create({
                    ...d,
                    inventorySheet: savedSheet,
                }),
            );

            await this.detailsRepository.save(details);
        }

        return {
            message: 'Hoja de inventario creada exitosamente',
        }
    }

    private async validateWarehouseExists(id: number): Promise<void> {
        const warehouse = await this.warehouseService.findOne(id);
        if (!warehouse) {
            throw new HttpException('Almacén no encontrado', HttpStatus.NOT_FOUND);
        }
    }

    private async validateInventorySheetExists(id: number): Promise<void> {
        const sheet = await this.sheetsRepository.findOne({ where: { id } });
        if (!sheet) {
            throw new HttpException('Hoja de inventario no encontrada', HttpStatus.NOT_FOUND);
        }
    }

    async findAll(filters: InventorySheetFilters) {
        try {
            const query = this.sheetsRepository.createQueryBuilder('sheet')
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
                console.log('entró');
                query.andWhere('sheet.emissionDate >= :dateFrom', { dateFrom: filters.dateFrom });
            }
            if (filters.dateTo) {
                console.log('entró2');
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

    async findOne(id: number): Promise<InventorySheet | null> {
        try {

            await this.validateInventorySheetExists(id);

            return this.sheetsRepository.createQueryBuilder('sheet')
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

    async update(id: number, dto: CreateInventoryDto, userId: number) {
        try {
            if (!userId) {
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            const sheet = await this.sheetsRepository.findOne({
                where: { id },
                relations: ['details', 'warehouse'],
            });

            if (!sheet) {
                throw new HttpException('Hoja de inventario no encontrada', HttpStatus.NOT_FOUND);
            }

            await this.validateWarehouseExists(dto.sheet.warehouseId);

            // Actualizar la hoja
            Object.assign(sheet, {
                ...dto.sheet,
                userId,
                warehouse: { id: dto.sheet.warehouseId },
            });

            const updatedSheet = await this.sheetsRepository.save(sheet);

            // Manejo de detalles
            if (dto.details?.length > 0) {
                // Borrar los detalles anteriores (opcional, depende de tu negocio)
                await this.detailsRepository.delete({ inventorySheet: { id } });

                // Crear los nuevos
                const details = dto.details.map((d) =>
                    this.detailsRepository.create({
                        ...d,
                        inventorySheet: updatedSheet,
                    }),
                );

                await this.detailsRepository.save(details);
            }

            return this.sheetsRepository.findOne({
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

    async remove(id: number): Promise<void> {
        try {
            await this.validateInventorySheetExists(id);
            await this.sheetsRepository.delete(id);
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