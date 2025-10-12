import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchTenantDto {
    @ApiProperty({
        description: 'Tenant ID to switch to',
        example: 'empresa1',
    })
    @IsString()
    tenantId: string;
}
