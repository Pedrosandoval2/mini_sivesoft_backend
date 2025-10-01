import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { InventorySheetDetail } from './entities/inventory-sheet-detail.entity';
import { UpdateInventorySheetDto } from './dto/update-inventory-sheet.dto';
import { InventorySheet } from './entities/inventiory-sheet.entity';
import { CreateInventoryDto } from './dto/create-inventory-details';
import { WarehousesService } from 'src/warehouses/warehouses.service';

interface InventorySheetFilters {
    dateFrom?: string;
    dateTo?: string;
    warehouseName?: string;
}

@Injectable()
export class InventorySheetsService {
    constructor(
        @InjectRepository(InventorySheet)
        readonly sheetsRepository: Repository<InventorySheet>,
        @InjectRepository(InventorySheetDetail)
        readonly detailsRepository: Repository<InventorySheetDetail>,
        readonly warehouseService: WarehousesService
    ) { }

    async create(dto: CreateInventoryDto, userId: number) {

        if (!userId) {
            throw new Error('User ID is required to create an inventory sheet.');
        }

        const sheet = this.sheetsRepository.create({
            ...dto.sheet,
            userId,
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

        return this.sheetsRepository.findOne({
            where: { id: savedSheet.id },
            relations: ['warehouse', 'details'],
        });
    }

    async findAll(filters: InventorySheetFilters): Promise<InventorySheet[]> {
        const query = this.sheetsRepository.createQueryBuilder('sheet')
            .leftJoinAndSelect('sheet.warehouse', 'warehouse')
            .leftJoinAndSelect('sheet.details', 'details');


        if (filters.warehouseName) {
            query.andWhere('warehouse.name = :warehouseName', { warehouseName: filters.warehouseName });
        }

        if (filters.dateFrom) {
            query.andWhere('sheet.emissionDate >= :dateFrom', { dateFrom: filters.dateFrom });
        }
        if (filters.dateTo) {
            query.andWhere('sheet.emissionDate <= :dateTo', { dateTo: filters.dateTo });
        }
        return query.getMany();
    }

    async findOne(id: string): Promise<InventorySheet | null> {
        return this.sheetsRepository.findOne({
            where: { id: Number(id) },
            relations: ['warehouse', 'user', 'details'],
        });
    }

    async update(id: string, updateInventorySheetDto: UpdateInventorySheetDto): Promise<InventorySheet | null> {
        await this.sheetsRepository.update(id, updateInventorySheetDto);
        return this.findOne(id);
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