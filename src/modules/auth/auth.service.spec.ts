import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserBuilder } from '../../../test/builders/user.builder.js';
import * as bcrypt from 'bcrypt';

describe('AuthService Integration', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'testSecretKey',
          signOptions: { expiresIn: '60m' },
        }),
        PrismaModule,
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
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

  describe('validateUser', () => {
    it('should return user if validation is successful', async () => {
      const password = 'password123';
      const user = await new UserBuilder()
        .withEmail('validate@example.com')
        .withPassword(password)
        .build(prisma);

      const result = await service.validateUser(user.email, password);
      expect(result).toBeDefined();
      expect(result.email).toBe(user.email);
    });

    it('should return null if password is wrong', async () => {
      const user = await new UserBuilder()
        .withEmail('wrongpass@example.com')
        .build(prisma);

      const result = await service.validateUser(user.email, 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      const result = await service.validateUser('nonexistent@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const password = 'password123';
      const user = await new UserBuilder()
        .withEmail('login@example.com')
        .withPassword(password)
        .build(prisma);

      const loginDto = {
        email: user.email,
        password: password,
      };

      const result = await service.login(loginDto);
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const registerDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const result = await service.register(registerDto);
      expect(result).toHaveProperty('access_token');

      const user = await prisma.user.findUnique({ where: { email: registerDto.email } });
      expect(user).toBeDefined();
      expect(user?.name).toBe(registerDto.name);
    });
  });
});
