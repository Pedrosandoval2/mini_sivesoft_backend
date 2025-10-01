// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        readonly usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = this.usersRepository.create({
                ...createUserDto,
                password: hashedPassword,
            });
            return await this.usersRepository.save(user);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async findAll(): Promise<User[]> {
        try {
            return await this.usersRepository.find();
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async findOne(id: number): Promise<User | null> {
        try {
            return await this.usersRepository.findOne({
                where: { id },
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

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
        try {
            if (updateUserDto.password) {
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            await this.usersRepository.update(id, updateUserDto);
            return await this.findOne(id);
        } catch (error) {
            throw new Error(`Error updating user with id ${id}: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            await this.usersRepository.delete(id);
        } catch (error) {
            throw new Error(`Error removing user with id ${id}: ${error.message}`);
        }
    }
}