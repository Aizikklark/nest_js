import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const newUser = this.userRepository.create(user);
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    // Проверяем, существует ли пользователь перед обновлением
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    try {
      // Обновляем пользователя
      await this.userRepository.update(id, user);
      
      // Получаем обновленного пользователя
      const updatedUser = await this.userRepository.findOneBy({ id });
      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found after update`);
      }
      return updatedUser;
    } catch (error) {
      // Обработка исключений
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    try {
        return await this.userRepository.delete(id);
      } catch (error) {
        throw new InternalServerErrorException('Failed to delete user');
      }
  }
}
