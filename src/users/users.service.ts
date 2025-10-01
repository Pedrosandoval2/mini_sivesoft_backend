// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Warehouse } from 'src/warehouses/entities/warehouse.entity';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        readonly usersRepository: Repository<User>,
        @InjectRepository(Warehouse)
        readonly warehousesRepository: Repository<Warehouse>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {

            const warehouses = await this.warehousesRepository.findBy({
                id: In(createUserDto.warehouseIds || [])
            });

            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = this.usersRepository.create({
                username: createUserDto.username,
                role: createUserDto.role,
                password: hashedPassword,
                warehouses
            });
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async addWarehousesToUser(userId: number, warehouseIds: number[]): Promise<User | null> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                relations: ['warehouses'],
            });

            if (!user) {
                throw new Error(`User with id ${userId} not found`);
            }

            const warehouses = await this.warehousesRepository.findBy({
                id: In(warehouseIds)
            });

            user.warehouses.push(...warehouses);
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new Error(`Error adding warehouses to user with id ${userId}: ${error.message}`);
        }
    }

    async findAll(): Promise<User[]> {
        try {
            return await this.usersRepository.find({
                relations: ['warehouses']
            });
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async findOne(id: number): Promise<User | null> {
        try {
            return await this.usersRepository.findOne({
                where: { id },
                relations: ['warehouses'],
            });
        } catch (error) {
            throw new Error(`Error finding user with id ${id}: ${error.message}`);
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        try {
            return await this.usersRepository.findOne({
                where: { username },
            });
        } catch (error) {
            throw new Error(`Error finding user with username ${username}: ${error.message}`);
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['warehouses'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (updateUserDto.warehouseIds) {
            const warehouses = await this.warehousesRepository.findBy({
                id: In(updateUserDto.warehouseIds),
            });

            user.warehouses = warehouses;
            delete updateUserDto.warehouseIds;
        }

        const result = this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(result);
    }
    
    async remove(id: number): Promise<void> {
        try {
            await this.usersRepository.delete(id);
        } catch (error) {
            throw new Error(`Error removing user with id ${id}: ${error.message}`);
        }
    }
}