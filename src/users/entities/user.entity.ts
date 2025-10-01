// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';

export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
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

    @ManyToMany(() => Warehouse, (warehouse) => warehouse.users)
    @JoinTable(
        {
            name: 'users_warehouses',
            joinColumn: { name: 'userId', referencedColumnName: 'id' },
            inverseJoinColumn: { name: 'warehouseId', referencedColumnName: 'id' },
        }
    )
    warehouses: Warehouse[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}