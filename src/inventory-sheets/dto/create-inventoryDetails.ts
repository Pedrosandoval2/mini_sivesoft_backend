import { IsNumber, IsString } from 'class-validator';

export class CreateInventorySheetDetailDto {
    @IsString()
    productId: string;

    @IsString()
    unit: string;

    @IsNumber()
    price: number;

    @IsNumber()
    quantity: number;
}