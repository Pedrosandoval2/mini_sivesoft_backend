import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { BusinessEntity } from './entities/businessEntity.entity';

@Injectable()
export class EntitiesService {
    constructor(
        @InjectRepository(BusinessEntity)
        readonly entitiesRepository: Repository<BusinessEntity>,
    ) { }

    async create(createEntityDto: CreateEntityDto): Promise<BusinessEntity> {
        try {

            const existingEntity = await this.entitiesRepository.findOne({
                where: { docNumber: createEntityDto.docNumber, docType: createEntityDto.docType }
            });

            if (existingEntity) {
                throw new Error(`Business entity with docNumber ${createEntityDto.docNumber} and docType ${createEntityDto.docType} already exists`);
            }

            const entity = this.entitiesRepository.create(createEntityDto);
            return await this.entitiesRepository.save(entity);
        } catch (error) {
            throw new Error(`Error creating business entity: ${error.message}`);
        }
    }

    async findAll(): Promise<BusinessEntity[]> {
        try {
            return await this.entitiesRepository.find();
        } catch (error) {
            throw new Error(`Error fetching business entities: ${error.message}`);
        }
    }

    async findOne(id: number): Promise<BusinessEntity | null> {
        try {
            return await this.entitiesRepository.findOne({
                where: { id },
                relations: ['user'],
            });
        } catch (error) {
            throw new Error(`Error finding business entity with id ${id}: ${error.message}`);
        }
    }

    async update(id: number, updateEntityDto: UpdateEntityDto): Promise<BusinessEntity | null> {
        try {
            await this.entitiesRepository.update(id, updateEntityDto);
            return await this.findOne(id);
        } catch (error) {
            throw new Error(`Error updating business entity with id ${id}: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            await this.entitiesRepository.delete(id);
        } catch (error) {
            throw new Error(`Error removing business entity with id ${id}: ${error.message}`);
        }
    }
}