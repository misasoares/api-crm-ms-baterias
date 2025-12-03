import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CustomerBuilder } from '../../../test/builders/customer.builder.js';

describe('CustomersService Integration', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [CustomersService],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.customer.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createCustomerDto = {
        name: 'Test Customer',
        phone: '1234567890',
      };

      const result = await service.create(createCustomerDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(createCustomerDto.name);

      const customer = await prisma.customer.findFirst({ where: { phone: createCustomerDto.phone } });
      expect(customer).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      await new CustomerBuilder().withName('C1').build(prisma);
      await new CustomerBuilder().withName('C2').withPhone('0987654321').build(prisma);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should find a customer by id', async () => {
      const customer = await new CustomerBuilder().build(prisma);

      const result = await service.findOne(customer.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(customer.id);
    });
  });
});
