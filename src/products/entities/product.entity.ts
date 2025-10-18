import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ProductUnit {
    UNIDADES = 'unidades',
    CAJAS = 'cajas',
    PAQUETES = 'paquetes',
    LITROS = 'litros',
    KILOGRAMOS = 'kilogramos',
}

@Entity('products')
@Index(['name', 'unit'], { unique: true })
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ProductUnit,
        default: ProductUnit.UNIDADES,
    })
    unit: ProductUnit;

    @Column({ unique: true })
    barcode: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
