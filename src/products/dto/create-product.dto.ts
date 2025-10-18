import { IsString, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductUnit } from '../entities/product.entity';

export class CreateProductDto {
    @ApiProperty({ description: 'Nombre del producto', example: 'Chocolate Chocman' })
    @IsString()
    name: string;

    @ApiProperty({
        enum: ProductUnit,
        description: 'Unidad de medida del producto',
        example: 'cajas'
    })
    @IsEnum(ProductUnit)
    unit: ProductUnit;

    @ApiProperty({ description: 'Código de barras del producto', example: '7501234567890' })
    @IsString()
    barcode: string;

    @ApiProperty({ description: 'Precio por unidad', example: 25.5 })
    @IsNumber()
    @IsPositive()
    price: number;
}
