import { IsString, IsEnum, MinLength, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ 
        type: [String], 
        description: 'Array of tenant IDs (empresas) the user belongs to',
        example: ['empresa1', 'empresa2']
    })
    @IsArray()
    @IsString({ each: true })
    tenantIds: string[];

    @ApiProperty({ required: false, description: 'ID of the related Business Entity', example: 1 })
    @IsOptional()
    @IsNumber()
    entityRelationId?: number;

    @ApiProperty({ type: [Number], description: 'Array of warehouse IDs', required: false })
    @IsOptional()
    @IsArray()
    warehouseIds?: number[];
}