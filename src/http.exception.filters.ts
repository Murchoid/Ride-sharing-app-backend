import {
  Catch,
  HttpException,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LogsService } from './AppLogs/logs.service';
import { Request, Response } from 'express';

// Interface for standardized error response
interface MyResponseObj {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logs = new LogsService();

  private getClientIp(request: Request): string {
    
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      
      return Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
    }
    return request.ip || 'unknown';
  }

  override catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const clientIp = this.getClientIp(request);

    const myResponseObj: MyResponseObj = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof Error) {
      myResponseObj.response = exception.message;
    } else {
      myResponseObj.response = 'Internal Server Error';
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);

    const logMessage =
      typeof myResponseObj.response === 'string'
        ? myResponseObj.response
        : JSON.stringify(myResponseObj.response); // Log the error with client IP and path (ignore promise)
    void this.logs.logToFile(
      `ERROR: ${logMessage} - Path: ${request.url}`,
      clientIp,
    );
  }
}