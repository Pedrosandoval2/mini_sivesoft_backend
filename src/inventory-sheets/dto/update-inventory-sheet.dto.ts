import { PartialType } from '@nestjs/swagger';
import { CreateInventorySheetDto } from './create-inventory-sheet.dto';

export class UpdateInventorySheetDto extends PartialType(CreateInventorySheetDto) { }