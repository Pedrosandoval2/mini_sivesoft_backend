
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventorySheet } from 'src/inventory-sheets/entities/inventiory-sheet.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('warehouses')
export class Warehouse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    ownerId: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, (entity) => entity.warehouses)
    owner: User;

    @OneToMany(() => InventorySheet, (sheet) => sheet.warehouse)
    inventorySheets: InventorySheet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}