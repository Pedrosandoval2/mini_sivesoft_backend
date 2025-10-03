import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { InventorySheetDetail } from './inventory-sheet-detail.entity';
import { User } from 'src/users/entities/user.entity';

export enum InventorySheetState {
    REGISTERED = 'registered',
    FINISHED = 'finished',
}

@Entity('inventory_sheets')
export class InventorySheet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emissionDate: Date;

    @Column()
    serie: string;

    @ManyToOne(() => User, (user) => user.inventorySheets, { eager: true })
    user: User;

    @Column({
        type: 'enum',
        enum: InventorySheetState,
        default: InventorySheetState.REGISTERED,
    })
    state: InventorySheetState;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventorySheets)
    warehouse: Warehouse;

    @OneToMany(() => InventorySheetDetail, (detail) => detail.inventorySheet, {
        cascade: true,
    })
    details: InventorySheetDetail[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}