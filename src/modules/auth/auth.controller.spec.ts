import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserBuilder } from '../../../test/builders/user.builder.js';

describe('AuthController Integration', () => {
  let controller: AuthController;
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
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
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

  describe('login', () => {
    it('should return access token', async () => {
      const password = 'password123';
      const user = await new UserBuilder()
        .withEmail('controllerlogin@example.com')
        .withPassword(password)
        .build(prisma);

      const loginDto = {
        email: user.email,
        password: password,
      };

      const result = await controller.login(loginDto);
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('register', () => {
    it('should register user and return token', async () => {
      const registerDto = {
        name: 'Controller User',
        email: 'controller@example.com',
        password: 'password123',
      };

      const result = await controller.register(registerDto);
      expect(result).toHaveProperty('access_token');

      const user = await prisma.user.findUnique({
        where: { email: registerDto.email },
      });
      expect(user).toBeDefined();
    });
  });
});
