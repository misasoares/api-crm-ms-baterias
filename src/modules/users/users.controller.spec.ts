import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserBuilder } from '../../../test/builders/user.builder.js';

describe('UsersController Integration', () => {
  let controller: UsersController;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'Controller User',
        email: 'controller@example.com',
        password: 'password123',
      };

      const result = await controller.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      await new UserBuilder().withEmail('user1@example.com').build(prisma);
      await new UserBuilder().withEmail('user2@example.com').build(prisma);

      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await new UserBuilder()
        .withEmail('findone@example.com')
        .build(prisma);

      const result = await controller.findOne(user.uid);
      expect(result).toBeDefined();
      expect(result.email).toBe(user.email);
    });
  });
});
