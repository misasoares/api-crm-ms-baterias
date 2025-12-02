import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { UserBuilder } from '../../../test/builders/user.builder';

describe('UsersService Integration', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);

      const user = await prisma.user.findUnique({ where: { email: createUserDto.email } });
      expect(user).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await new UserBuilder()
        .withEmail('find@example.com')
        .build(prisma);

      const result = await service.findByEmail(user.email);
      expect(result).toBeDefined();
      expect(result?.uid).toBe(user.uid);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const user = await new UserBuilder()
        .withEmail('findid@example.com')
        .build(prisma);

      const result = await service.findOne(user.uid);
      expect(result).toBeDefined();
      expect(result?.email).toBe(user.email);
    });
  });
});
