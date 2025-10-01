import { IsString, IsBoolean, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty()
    ownerId: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}