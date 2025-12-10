import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CustomerBuilder } from '../../../test/builders/customer.builder.js';

describe('CustomersController Integration', () => {
  let controller: CustomersController;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [CustomersController],
      providers: [CustomersService],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.customer.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createCustomerDto = {
        name: 'Controller Customer',
        phone: '0987654321',
      };

      const result = await controller.create(createCustomerDto);
      expect(result).toBeDefined();
      expect(result.data.name).toBe(createCustomerDto.name);
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      await new CustomerBuilder().withName('C1').build(prisma);
      await new CustomerBuilder()
        .withName('C2')
        .withPhone('0987654321')
        .build(prisma);

      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const customer = await new CustomerBuilder().build(prisma);

      const result = await controller.findOne(customer.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(customer.id);
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      await expect(controller.findOne('non-existent-id')).rejects.toThrow();
    });
  });
  describe('update', () => {
    it('should update a customer', async () => {
      const customer = await new CustomerBuilder().build(prisma);
      const updateCustomerDto = {
        name: 'Updated Customer',
      };

      const result = await controller.update(customer.id, updateCustomerDto);
      expect(result).toBeDefined();
      expect(result.data.name).toBe(updateCustomerDto.name);
    });
  });
});
