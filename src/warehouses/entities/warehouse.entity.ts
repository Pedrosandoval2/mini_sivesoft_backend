
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
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

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => User, (user) => user.warehouses)
    users: User[];

    @ManyToMany(() => InventorySheet, (sheet) => sheet.warehouses)
    @JoinTable(
        {
            name: 'warehouses_inventory_sheets',
            joinColumn: { name: 'warehouseId', referencedColumnName: 'id' },
            inverseJoinColumn: { name: 'inventorySheetId', referencedColumnName: 'id' },
        }
    )
    inventorySheets: InventorySheet[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}