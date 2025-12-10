import { ResponseInterceptor } from './response.interceptor.js';
import { of } from 'rxjs';
import { jest } from '@jest/globals';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('should transform response', (done) => {
    const mockHandler = {
      handle: () => of({ prop: 'value' }),
    };

    const mockResponse = { statusCode: 200 };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };

    interceptor.intercept(mockContext as any, mockHandler as any).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: { prop: 'value' },
        code: 200,
        message: 'Operação realizada com sucesso',
      });
      done();
    });
  });

  it('should transform response with custom message', (done) => {
     const mockHandler = {
      handle: () => of({ message: 'Custom', data: { id: 1 } }),
    };

    const mockResponse = { statusCode: 201 };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };

    interceptor.intercept(mockContext as any, mockHandler as any).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: { id: 1 },
        code: 201,
        message: 'Custom',
      });
      done();
    });
  });
});
