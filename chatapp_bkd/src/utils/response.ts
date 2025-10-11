import { Response } from 'express';

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ResponseHelper {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): void {
    const response: APIResponse<T> = {
      success: true,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, errors?: any[]): void {
    const response: APIResponse = {
      success: false,
      message,
      errors
    };
    res.status(statusCode).json(response);
  }

  static validationError(res: Response, message: string, errors: any[]): void {
    this.error(res, message, 400, errors);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, message, 403);
  }

  static conflict(res: Response, message: string = 'Conflict'): void {
    this.error(res, message, 409);
  }

  static paginated<T>(
    res: Response, 
    message: string, 
    data: T[], 
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }
  ): void {
    const response: APIResponse<T[]> = {
      success: true,
      message,
      data,
      pagination
    };
    res.json(response);
  }
}
