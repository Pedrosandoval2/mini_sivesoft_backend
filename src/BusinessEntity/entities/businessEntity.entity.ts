import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';

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


    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User, (user) => user.entityRelation, { nullable: true })
    user: User | null;

    @UpdateDateColumn()
    updatedAt: Date;
}