import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { BusinessEntity } from './entities/businessEntity.entity';
import { TenantConnectionService } from '../tenant/tenant-connection.service';

@Injectable()
export class EntitiesService {
    constructor(
        private readonly tenantConnectionService: TenantConnectionService,
    ) { }

    async create(createEntityDto: CreateEntityDto, tenantId: string) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const entitiesRepository = connection.getRepository(BusinessEntity);
            
            const existingEntity = await entitiesRepository.findOne({
                where: { docNumber: createEntityDto.docNumber, docType: createEntityDto.docType },
            });

            if (existingEntity) {
                throw new HttpException('El número de documento ya está registrado', HttpStatus.CONFLICT);
            }

            const entity = entitiesRepository.create(createEntityDto);
            return await entitiesRepository.save(entity);
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

    async findAll({ page = 1, limit = 10, query, tenantId, onlyUnassigned = false }: { page?: number; limit?: number; query?: string; tenantId: string; onlyUnassigned?: boolean }) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const entitiesRepository = connection.getRepository(BusinessEntity);
            
            const qb = entitiesRepository.createQueryBuilder('entity')
                .leftJoin('entity.user', 'user')
                .take(limit)
                .skip((page - 1) * limit);

            // Si onlyUnassigned es true, filtrar solo entidades sin usuario asignado
            if (onlyUnassigned) {
                qb.where('user.id IS NULL');
            }

            // Si hay búsqueda, filtrar por nombre, documento o teléfono
            if (query && query.trim() !== '') {
                if (onlyUnassigned) {
                    qb.andWhere(
                        '(LOWER(entity.name) LIKE :query OR LOWER(entity.docNumber) LIKE :query OR LOWER(entity.phone) LIKE :query)',
                        { query: `%${query.toLowerCase()}%` }
                    );
                } else {
                    qb.where(
                        '(LOWER(entity.name) LIKE :query OR LOWER(entity.docNumber) LIKE :query OR LOWER(entity.phone) LIKE :query)',
                        { query: `%${query.toLowerCase()}%` }
                    );
                }
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



    async findOne(id: number, tenantId: string): Promise<BusinessEntity | null> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const entitiesRepository = connection.getRepository(BusinessEntity);
            
            const entity = await entitiesRepository.findOne({
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

    async update(id: number, updateEntityDto: UpdateEntityDto, tenantId: string): Promise<BusinessEntity | null> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const entitiesRepository = connection.getRepository(BusinessEntity);
            
            const existingEntity = await entitiesRepository.findOne({ where: { id } });

            if (!existingEntity) {
                throw new HttpException('Entidad no encontrada', HttpStatus.NOT_FOUND);
            }

            // Verificar duplicado de documento si se está actualizando
            if (updateEntityDto.docNumber || updateEntityDto.docType) {
                const duplicateEntity = await entitiesRepository.findOne({
                    where: {
                        docNumber: updateEntityDto.docNumber || existingEntity.docNumber,
                        docType: updateEntityDto.docType || existingEntity.docType
                    },
                });

                if (duplicateEntity && duplicateEntity.id !== id) {
                    throw new HttpException('El número de documento ya está registrado', HttpStatus.CONFLICT);
                }
            }

            await entitiesRepository.update(id, updateEntityDto);
            return await entitiesRepository.findOne({
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

    async remove(id: number, tenantId: string): Promise<void> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const entitiesRepository = connection.getRepository(BusinessEntity);
            
            const entity = await entitiesRepository.findOne({ 
                where: { id },
                relations: ['warehouses']
            });

            if (!entity) {
                throw new HttpException('Entidad no encontrada', HttpStatus.NOT_FOUND);
            }

            if (entity.warehouses && entity.warehouses.length > 0) {
                throw new HttpException(
                    `No se puede eliminar la entidad porque tiene ${entity.warehouses.length} almacén(es) asociado(s). Primero elimine o reasigne los almacenes.`,
                    HttpStatus.CONFLICT,
                );
            }

            await entitiesRepository.delete(id);
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