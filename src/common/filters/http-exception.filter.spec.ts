import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { jest } from '@jest/globals';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
const mockHttpArgumentsHost = jest.fn().mockReturnValue({
  getResponse: mockGetResponse,
  getRequest: jest.fn(),
});
const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getType: jest.fn(),
};

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  it('should catch HttpException and format response', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    filter.catch(exception, mockArgumentsHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: 'Forbidden',
      code: HttpStatus.FORBIDDEN,
    });
  });

  it('should catch unknown exception and format as Internal Server Error', () => {
    const exception = new Error('Random Error');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    filter.catch(exception, mockArgumentsHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
      code: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it('should handle object response messages', () => {
    const exception = new HttpException(
      { message: ['error1', 'error2'] },
      HttpStatus.BAD_REQUEST,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    filter.catch(exception, mockArgumentsHost as any);

    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: 'error1, error2',
      code: HttpStatus.BAD_REQUEST,
    });
  });
});
