import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventorySheetDetail } from './entities/inventory-sheet-detail.entity';
import { CreateInventorySheetDto } from './dto/create-inventory-sheet.dto';
import { UpdateInventorySheetDto } from './dto/update-inventory-sheet.dto';
import { InventorySheet } from './entities/inventiory-sheet.entity';

interface InventorySheetFilters {
    dateFrom?: string;
    dateTo?: string;
    warehouseId?: string;
}

@Injectable()
export class InventorySheetsService {
    constructor(
        @InjectRepository(InventorySheet)
        readonly sheetsRepository: Repository<InventorySheet>,
        @InjectRepository(InventorySheetDetail)
        readonly detailsRepository: Repository<InventorySheetDetail>,
    ) { }

    async create(createInventorySheetDto: CreateInventorySheetDto, userId: string): Promise<InventorySheet> {
        const sheet = this.sheetsRepository.create({
            ...createInventorySheetDto,
            userId: Number(userId),
        });
        return this.sheetsRepository.save(sheet);
    }

    async findAll(filters: InventorySheetFilters): Promise<InventorySheet[]> {
        const query = this.sheetsRepository.createQueryBuilder('sheet')
            .leftJoinAndSelect('sheet.warehouse', 'warehouse')
            .leftJoinAndSelect('sheet.user', 'user');

        if (filters.warehouseId) {
            query.andWhere('sheet.warehouseId = :warehouseId', { warehouseId: filters.warehouseId });
        }

        if (filters.dateFrom && filters.dateTo) {
            query.andWhere('sheet.emissionDate BETWEEN :dateFrom AND :dateTo', {
                dateFrom: new Date(filters.dateFrom),
                dateTo: new Date(filters.dateTo),
            });
        } else if (filters.dateFrom) {
            query.andWhere('sheet.emissionDate >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
        } else if (filters.dateTo) {
            query.andWhere('sheet.emissionDate <= :dateTo', { dateTo: new Date(filters.dateTo) });
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

    async remove(id: string): Promise<void> {
        // Primero eliminar los detalles
        await this.detailsRepository.delete({ inventorySheetId: Number(id) });
        // Luego eliminar la hoja
        await this.sheetsRepository.delete(Number(id));
    }

    async addDetail(sheetId: string, detailData: Partial<InventorySheetDetail>): Promise<InventorySheetDetail> {
        const detail = this.detailsRepository.create({
            ...detailData,
            inventorySheetId: Number(sheetId),
        });
        return this.detailsRepository.save(detail);
    }
}