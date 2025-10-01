import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateInventorySheetDto } from './create-inventory-sheet.dto';
import { CreateInventorySheetDetailDto } from './create-inventoryDetails';

export class CreateInventoryDto {
  @ValidateNested()
  @Type(() => CreateInventorySheetDto)
  sheet: CreateInventorySheetDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventorySheetDetailDto)
  details: CreateInventorySheetDetailDto[];
}