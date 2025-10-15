
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { InventorySheet } from 'src/inventory-sheets/entities/inventiory-sheet.entity';
import { User } from 'src/users/entities/user.entity';
import { BusinessEntity } from 'src/BusinessEntity/entities/businessEntity.entity';

@Entity('warehouses')
export class Warehouse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    serieWarehouse: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => User, (user) => user.warehouses)
    users: User[];

    @ManyToOne(() => BusinessEntity, (businessEntity) => businessEntity.warehouses, { nullable: true })
    @JoinColumn({ name: 'ownerId' })
    owner: BusinessEntity;

    @OneToMany(() => InventorySheet, (inventorySheet) => inventorySheet.warehouse)
    inventorySheets: InventorySheet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}