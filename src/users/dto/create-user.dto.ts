import { IsString, IsEnum, MinLength } from 'class-validator';
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
}