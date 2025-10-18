import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TenantConnectionService } from '../tenant/tenant-connection.service';

@Injectable()
export class ProductsService {
    constructor(
        private readonly tenantConnectionService: TenantConnectionService,
    ) { }

    async create(createProductDto: CreateProductDto, tenantId: string): Promise<Product> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const productsRepository = connection.getRepository(Product);

            // Validar que no exista un producto con el mismo nombre y unit
            const existingProductByNameAndUnit = await productsRepository.findOne({
                where: {
                    name: createProductDto.name,
                    unit: createProductDto.unit,
                },
            });

            if (existingProductByNameAndUnit) {
                throw new HttpException(
                    `Ya existe un producto con el nombre "${createProductDto.name}" y la unidad "${createProductDto.unit}". Debe cambiar el nombre o la unidad.`,
                    HttpStatus.CONFLICT,
                );
            }

            // Validar que el código de barras sea único
            const existingProductByBarcode = await productsRepository.findOne({
                where: { barcode: createProductDto.barcode },
            });

            if (existingProductByBarcode) {
                throw new HttpException(
                    `Ya existe un producto con el código de barras "${createProductDto.barcode}".`,
                    HttpStatus.CONFLICT,
                );
            }

            const product = productsRepository.create(createProductDto);
            return await productsRepository.save(product);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al crear el producto',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll({ page = 1, limit = 10, query, tenantId }: { page?: number; limit?: number; query?: string; tenantId: string }) {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const productsRepository = connection.getRepository(Product);

            const qb = productsRepository.createQueryBuilder('product')
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy('product.name', 'ASC');

            console.log("🚀 ~ ProductsService ~ findAll ~ query:", query)
            if (query) {
                console.log('entrada en el query');
                
                qb.where('LOWER(product.name) LIKE :query', { query: `%${query.toLowerCase()}%` })
                    .orWhere('LOWER(product.barcode) LIKE :query', { query: `%${query.toLowerCase()}%` });
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
                'Error interno al obtener los productos',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number, tenantId: string): Promise<Product> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const productsRepository = connection.getRepository(Product);

            const product = await productsRepository.findOne({ where: { id } });

            if (!product) {
                throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
            }

            return product;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al buscar el producto',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    
    async findOneBarCode(barcode: string, tenantId: string): Promise<Product> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const productsRepository = connection.getRepository(Product);

            const product = await productsRepository.createQueryBuilder('product')
                .where('product.barcode = :barcode', { barcode })
                .getOne();

            if (!product) {
                throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
            }

            return product;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al buscar el producto',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, updateProductDto: UpdateProductDto, tenantId: string): Promise<Product> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const productsRepository = connection.getRepository(Product);

            const product = await productsRepository.findOne({ where: { id } });

            if (!product) {
                throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
            }

            // Validar que no exista otro producto con el mismo nombre y unit
            if (updateProductDto.name || updateProductDto.unit) {
                const existingProductByNameAndUnit = await productsRepository.findOne({
                    where: {
                        name: updateProductDto.name || product.name,
                        unit: updateProductDto.unit || product.unit,
                    },
                });

                if (existingProductByNameAndUnit && existingProductByNameAndUnit.id !== id) {
                    throw new HttpException(
                        `Ya existe otro producto con el nombre "${updateProductDto.name || product.name}" y la unidad "${updateProductDto.unit || product.unit}".`,
                        HttpStatus.CONFLICT,
                    );
                }
            }

            // Validar que el código de barras sea único
            if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
                const existingProductByBarcode = await productsRepository.findOne({
                    where: { barcode: updateProductDto.barcode },
                });

                if (existingProductByBarcode && existingProductByBarcode.id !== id) {
                    throw new HttpException(
                        `Ya existe otro producto con el código de barras "${updateProductDto.barcode}".`,
                        HttpStatus.CONFLICT,
                    );
                }
            }

            await productsRepository.update(id, updateProductDto);
            const updatedProduct = await productsRepository.findOne({ where: { id } });
            
            if (!updatedProduct) {
                throw new HttpException('Producto no encontrado después de actualizar', HttpStatus.NOT_FOUND);
            }

            return updatedProduct;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al actualizar el producto',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: number, tenantId: string): Promise<void> {
        try {
            const connection = await this.tenantConnectionService.getTenantConnection(tenantId);
            const productsRepository = connection.getRepository(Product);

            const product = await productsRepository.findOne({ where: { id } });

            if (!product) {
                throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
            }

            await productsRepository.delete(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Error interno al eliminar el producto',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
