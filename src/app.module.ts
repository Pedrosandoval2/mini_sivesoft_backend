import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventorySheetsModule } from './inventory-sheets/inventory-sheets.module';
import { EntitiesModule } from './BusinessEntity/entities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3309,
      username: 'root',
      password: '12345',
      database: 'mini_sivesoft_backend',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }), UsersModule, AuthModule, WarehousesModule, InventorySheetsModule, EntitiesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
