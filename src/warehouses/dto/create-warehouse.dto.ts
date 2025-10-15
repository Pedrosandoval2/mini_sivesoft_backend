import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty({ required: false, description: 'ID del propietario del almacén (BusinessEntity)' })
    @IsOptional()
    @IsNumber()
    ownerId?: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ type: () => [Object], description: 'Lista de hojas de inventario asociadas al almacén', required: false })
    @IsOptional()
    inventorySheets?: any[];
}