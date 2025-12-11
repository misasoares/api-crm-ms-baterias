import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Reflector } from '@nestjs/core';
// import { ExecutionContext } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { jest } from '@jest/globals';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow public access', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should delegate to super.canActivate if not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    // Spy on the parent class method
    // Note: JwtAuthGuard extends AuthGuard('jwt').
    // In NestJS, AuthGuard('jwt') returns a class (a mixin).
    // Accessing prototype of the instance works.
    const superJwtSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true as any);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(superJwtSpy).toHaveBeenCalledWith(context);
  });
});
