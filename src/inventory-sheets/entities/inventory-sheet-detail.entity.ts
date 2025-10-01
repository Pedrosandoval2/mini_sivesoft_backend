import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventorySheet } from './inventiory-sheet.entity';

@Entity('inventory_sheet_details')
export class InventorySheetDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    quantity: number;

    @Column()
    unit: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => InventorySheet, (sheet) => sheet.details)
    inventorySheet: InventorySheet;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}