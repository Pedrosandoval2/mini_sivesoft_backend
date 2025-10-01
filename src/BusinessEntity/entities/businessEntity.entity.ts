import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity('business_entities')
export class BusinessEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    docType: string;

    @Column()
    docNumber: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    mobile: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}