// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';
import { InventorySheet } from 'src/inventory-sheets/entities/inventiory-sheet.entity';
import { BusinessEntity } from 'src/BusinessEntity/entities/businessEntity.entity';

export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    @Exclude()
    password: string;

    @OneToOne(() => BusinessEntity,(businessEntity) => businessEntity.user, { nullable: true })
    @JoinColumn()
    entityRelation: BusinessEntity;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @ManyToMany(() => Warehouse, (warehouse) => warehouse.users)
    @JoinTable(
        {
            name: 'users_warehouses',
            joinColumn: { name: 'userId', referencedColumnName: 'id' },
            inverseJoinColumn: { name: 'warehouseId', referencedColumnName: 'id' },
        }
    )
    warehouses: Warehouse[];

    @OneToMany(() => InventorySheet, (inventorySheet) => inventorySheet.user)
    inventorySheets: InventorySheet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}