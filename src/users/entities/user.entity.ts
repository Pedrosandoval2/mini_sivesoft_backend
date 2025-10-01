// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { InventorySheet } from 'src/inventory-sheets/entities/inventiory-sheet.entity';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';

export enum UserRole {
    ADMIN = 'admin',
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

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @OneToMany(() => Warehouse, (warehouse) => warehouse.owner)
    warehouses: Warehouse[];

    @OneToMany(() => InventorySheet, (sheet) => sheet.user)
    inventorySheets: InventorySheet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}