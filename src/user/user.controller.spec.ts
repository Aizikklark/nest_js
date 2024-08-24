import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn().mockResolvedValue(new User()),
            findAll: jest.fn().mockResolvedValue([new User()]),
            findOne: jest.fn().mockResolvedValue(new User()),
            update: jest.fn().mockResolvedValue(new User()),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = { name: 'John', email: 'john@example.com', age: 30 };
      const result = await controller.create(createUserDto);
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([new User()]);
    });
  });

  // Добавьте другие тесты для findOne, update, remove и т.д.
});
