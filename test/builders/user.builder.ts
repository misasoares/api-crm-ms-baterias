import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export class UserBuilder {
  private data: Partial<User> = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  withName(name: string): UserBuilder {
    this.data.name = name;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.data.email = email;
    return this;
  }

  withPassword(password: string): UserBuilder {
    this.data.password = password;
    return this;
  }

  async build(prisma: PrismaClient): Promise<User> {
    const hashedPassword = await bcrypt.hash(this.data.password!, 10);
    return prisma.user.create({
      data: {
        ...this.data,
        password: hashedPassword,
      } as User,
    });
  }
}
