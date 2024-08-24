import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUser = new User();
  mockUser.id = 1;
  mockUser.name = 'John Doe';
  mockUser.email = 'john.doe@example.com';
  mockUser.age = 30;

  const mockRepository = {
    save: jest.fn().mockResolvedValue(mockUser),
    findOneBy: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockResolvedValue([mockUser]),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    create: jest.fn().mockReturnValue(mockUser),
  };
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john.doe@example.com', age: 30 };
      const result = await service.create(createUserDto);
  
      // Проверяем, что метод create возвращает ожидаемый объект
      expect(result).toEqual(mockUser);
  
      // Проверяем, что метод create был вызван с createUserDto
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
  
      // Проверяем, что метод save был вызван с объектом User, а не DTO
      expect(repository.save).toHaveBeenCalledWith({
        ...createUserDto,
        id: expect.any(Number) // id создается автоматически и будет проверен как число
      });
    });
  
    it('should throw an error if creation fails', async () => {
      (repository.save as jest.Mock).mockRejectedValue(new Error());
      await expect(service.create({ name: 'John Doe' })).rejects.toThrow(InternalServerErrorException);
    });
  });
  

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw an error if user is not found', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto = { name: 'John Updated', email: 'john.updated@example.com', age: 31 };
      // Настроим моки так, чтобы `findOneBy` возвращал пользователя
      (repository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (repository.update as jest.Mock).mockResolvedValue({ affected: 1 });
  
      const result = await service.update(1, updateUserDto);
      expect(result).toEqual(mockUser);
      expect(repository.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  
    it('should throw an error if user is not found', async () => {
      // Настроим моки так, чтобы `findOneBy` возвращал null
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);
  
      await expect(service.update(999, { name: 'Nonexistent User' })).rejects.toThrow(NotFoundException);
    });
  
    it('should throw an InternalServerErrorException if update fails', async () => {
      // Настроим моки так, чтобы `update` выбрасывал исключение
      (repository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (repository.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
  
      await expect(service.update(1, { name: 'Failing Update' })).rejects.toThrow(InternalServerErrorException);
    });
  });
  

  describe('remove', () => {
    it('should delete a user', async () => {
      const result = await service.remove(1);
      expect(result).toEqual({ affected: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
