import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [TenantModule],
    controllers: [EntitiesController],
    providers: [EntitiesService],
    exports: [EntitiesService],
})
export class EntitiesModule { }