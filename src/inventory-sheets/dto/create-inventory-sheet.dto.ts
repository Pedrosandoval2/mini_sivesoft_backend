import { IsString, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InventorySheetState } from '../entities/inventiory-sheet.entity';

export class CreateInventorySheetDto {
    @ApiProperty()
    @IsNumber()
    warehouseId: number;

    @ApiProperty()
    @IsDateString()
    emissionDate: Date;

    @ApiProperty()
    @IsString()
    serie: string;

    @ApiProperty()
    @IsString()
    sheetNumber: string;

    @ApiProperty({ enum: InventorySheetState, required: false })
    @IsOptional()
    @IsEnum(InventorySheetState)
    state?: InventorySheetState;
}
