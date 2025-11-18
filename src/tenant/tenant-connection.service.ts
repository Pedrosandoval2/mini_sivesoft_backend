import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { BusinessEntity } from '../BusinessEntity/entities/businessEntity.entity';
import { InventorySheet } from '../inventory-sheets/entities/inventiory-sheet.entity';
import { InventorySheetDetail } from '../inventory-sheets/entities/inventory-sheet-detail.entity';
import { Product } from '../products/entities/product.entity';

interface TenantDbConfig {
    database: string;
    username: string;
    password: string;
}

@Injectable()
export class TenantConnectionService implements OnModuleDestroy {
    // Mapa de conexiones por tenant
    private readonly dataSources = new Map<string, DataSource>();

    // Configuración de bases de datos por tenant
    private readonly tenants: Record<string, TenantDbConfig> = {
        empresa1: {
            database: 'mini_sivesoft_backend',
            username: 'admin',
            password: 'Cl@veS3cr3t',
        },
        empresa2: {
            database: 'mini_sivesoft_backend_2',
            username: 'admin',
            password: 'Cl@veS3cr3t',
        },
        empresa3: {
            database: 'mini_sivesoft_backend_3',
            username: 'admin',
            password: 'Cl@veS3cr3t',
        },
    };

    async getTenantConnection(tenantId: string): Promise<DataSource> {
        if (!tenantId || !this.tenants[tenantId]) {
            throw new Error(`Tenant ${tenantId} no configurado`);
        }

        // Si ya existe la conexión, la retorna
        if (this.dataSources.has(tenantId)) {
            const existingDataSource = this.dataSources.get(tenantId);
            if (existingDataSource?.isInitialized) {
                return existingDataSource;
            }
        }

        // Crear nueva conexión
        const config = this.tenants[tenantId];
        const dataSource = new DataSource({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: Number.parseInt(process.env.DB_PORT || '3309'),
            username: config.username,
            password: config.password,
            database: config.database,
            entities: [
                User,
                Warehouse,
                BusinessEntity,
                InventorySheet,
                InventorySheetDetail,
                Product,
            ],
            synchronize: true, // Solo en desarrollo - crea las tablas automáticamente
            logging: false, // Desactivado - no mostrar queries SQL en consola
        });

        // Inicializar la conexión
        await dataSource.initialize();
        // Guardar la conexión en el mapa de conexiones
        this.dataSources.set(tenantId, dataSource);
        
        return dataSource;
    }

    // Obtener repositorio para una entidad específica en un tenant
    getTenantRepository<T>(tenantId: string, entity: any) {
        const dataSource = this.dataSources.get(tenantId);
        if (!dataSource) {
            throw new Error(`No hay conexión para tenant ${tenantId}`);
        }
        return dataSource.getRepository(entity);
    }

    // Obtener lista de todos los tenants configurados
    getAllTenants(): string[] {
        return Object.keys(this.tenants);
    }

    // Cerrar conexiones al destruir el módulo
    async onModuleDestroy() {
        // Cerrar todas las conexiones al destruir el módulo
        for (const [, dataSource] of this.dataSources) {
            if (dataSource.isInitialized) {
                await dataSource.destroy();
            }
        }
        this.dataSources.clear();
    }
}
