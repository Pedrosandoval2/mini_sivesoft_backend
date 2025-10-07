import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

    async create(createEntityDto: CreateEntityDto) {
        try {
            const existingEntity = await this.entitiesRepository.findOne({
                where: { docNumber: createEntityDto.docNumber, docType: createEntityDto.docType },
            });

            if (existingEntity) {
                throw new HttpException('El número de documento ya está registrado', HttpStatus.CONFLICT);
            }

            const entity = this.entitiesRepository.create(createEntityDto);
            return await this.entitiesRepository.save(entity);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al crear la entidad',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll({ page = 1, limit = 10, query }: { page?: number; limit?: number; query?: string }) {
        try {
            const qb = this.entitiesRepository.createQueryBuilder('entity')
                .take(limit)
                .skip((page - 1) * limit);

            if (query) {
                qb
                    .where('LOWER(entity.name) LIKE :query', { query: `%${query.toLowerCase()}%` })
                    .orWhere('LOWER(entity.docNumber) LIKE :query', { query: `%${query.toLowerCase()}%` })
                    .orWhere('LOWER(entity.phone) LIKE :query', { query: `%${query.toLowerCase()}%` });
            }

            const [data, total] = await qb.getManyAndCount();

            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al obtener las entidades',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<BusinessEntity | null> {
        try {
            const entity = await this.entitiesRepository.findOne({
                where: { id },
                relations: ['user'],
            });

            if (!entity) {
                throw new HttpException('Entidad no encontrada', HttpStatus.NOT_FOUND);
            }

            return entity;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al buscar la entidad',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, updateEntityDto: UpdateEntityDto): Promise<BusinessEntity | null> {
        try {
            const existingEntity = await this.entitiesRepository.findOne({ where: { id } });

            if (!existingEntity) {
                throw new HttpException('Entidad no encontrada', HttpStatus.NOT_FOUND);
            }

            // Verificar duplicado de documento si se está actualizando
            if (updateEntityDto.docNumber || updateEntityDto.docType) {
                const duplicateEntity = await this.entitiesRepository.findOne({
                    where: {
                        docNumber: updateEntityDto.docNumber || existingEntity.docNumber,
                        docType: updateEntityDto.docType || existingEntity.docType
                    },
                });

                if (duplicateEntity && duplicateEntity.id !== id) {
                    throw new HttpException('El número de documento ya está registrado', HttpStatus.CONFLICT);
                }
            }

            await this.entitiesRepository.update(id, updateEntityDto);
            return await this.entitiesRepository.findOne({
                where: { id },
                relations: ['user']
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al actualizar la entidad',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const entity = await this.entitiesRepository.findOne({ where: { id } });

            if (!entity) {
                throw new HttpException('Entidad no encontrada', HttpStatus.NOT_FOUND);
            }

            await this.entitiesRepository.delete(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al eliminar la entidad',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}