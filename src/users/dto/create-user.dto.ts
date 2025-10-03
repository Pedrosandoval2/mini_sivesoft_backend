import { IsString, IsEnum, MinLength, IsArray, IsNumber } from 'class-validator';
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

    @ApiProperty({ required: false, description: 'ID of the related Business Entity', example: 1 })
    @IsNumber()
    entityRelationId: number;

    @ApiProperty({ type: [Number], description: 'Array of warehouse IDs' })
    @IsArray()
    warehouseIds: [];
}