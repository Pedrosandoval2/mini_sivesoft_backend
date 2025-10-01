import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';
import { InventorySheetDetail } from './inventory-sheet-detail.entity';

export enum InventorySheetState {
    REGISTERED = 'registered',
    FINISHED = 'finished',
}

@Entity('inventory_sheets')
export class InventorySheet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    warehouseId: number;

    @Column()
    emissionDate: Date;

    @Column()
    serie: string;

    @Column()
    sheetNumber: string;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: InventorySheetState,
        default: InventorySheetState.REGISTERED,
    })
    state: InventorySheetState;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventorySheets)
    warehouse: Warehouse;

    @ManyToOne(() => User, (user) => user.inventorySheets)
    user: User;

    @OneToMany(() => InventorySheetDetail, (detail) => detail.inventorySheet, {
        cascade: true,
    })
    details: InventorySheetDetail[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}