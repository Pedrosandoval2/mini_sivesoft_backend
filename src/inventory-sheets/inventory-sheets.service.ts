import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { InventorySheetDetail } from './entities/inventory-sheet-detail.entity';
import { UpdateInventorySheetDto } from './dto/update-inventory-sheet.dto';
import { InventorySheet } from './entities/inventiory-sheet.entity';
import { CreateInventoryDto } from './dto/create-inventory-details';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { UsersService } from 'src/users/users.service';

interface InventorySheetFilters {
    dateFrom?: string;
    dateTo?: string;
    warehouseName?: string;
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

        const warehouse = await this.warehouseService.findOne(dto.sheet.warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found.');
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
            message: 'Inventory sheet created successfully',
        }
    }

    async findAll(filters: InventorySheetFilters) {
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

        if (filters.warehouseName) {
            query.andWhere('LOWER(warehouse.name) LIKE :warehouseName', { warehouseName: `%${filters.warehouseName.toLowerCase()}%` });
        }

        if (filters.dateFrom) {
            query.andWhere('sheet.emissionDate >= :dateFrom', { dateFrom: filters.dateFrom });
        }
        if (filters.dateTo) {
            query.andWhere('sheet.emissionDate <= :dateTo', { dateTo: filters.dateTo });
        }

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            total,
            page: filters.page,
            limit: filters.limit,
            totalPages: Math.ceil(total / filters.limit),
        };
    }

    async findOne(id: string): Promise<InventorySheet | null> {
        return this.sheetsRepository.createQueryBuilder('sheet')
            .leftJoin('sheet.warehouse', 'warehouse')
            .addSelect(['warehouse.id', 'warehouse.name', 'warehouse.address', 'warehouse.isActive'])
            .leftJoin('sheet.details', 'details')
            .addSelect(['details.id', 'details.productId', 'details.unit', 'details.price', 'details.quantity'])
            .leftJoin('sheet.user', 'user')
            .addSelect(['user.id', 'user.username', 'user.role'])
            .where('sheet.id = :id', { id: Number(id) })
            .getOne();
    }

    async update(id: number, dto: CreateInventoryDto, userId: number) {
        if (!userId) {
            throw new Error('User ID is required to update an inventory sheet.');
        }

        const sheet = await this.sheetsRepository.findOne({
            where: { id },
            relations: ['details', 'warehouse'],
        });

        if (!sheet) {
            throw new Error('Inventory sheet not found.');
        }

        const warehouse = await this.warehouseService.findOne(dto.sheet.warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found.');
        }

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
    }

    async remove(id: number): Promise<void> {
        await this.detailsRepository.delete({ id: Number(id) });
        await this.sheetsRepository.delete(Number(id));
    }

    // async addDetail(sheetId: string, detailData: Partial<InventorySheetDetail>): Promise<InventorySheetDetail> {
    //     const detail = this.detailsRepository.create({
    //         ...detailData,
    //         inventorySheetId: Number(sheetId),
    //     });
    //     return this.detailsRepository.save(detail);
    // }
}