import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEntityDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    docType: string;

    @ApiProperty()
    @IsString()
    docNumber: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    mobile?: string;
}