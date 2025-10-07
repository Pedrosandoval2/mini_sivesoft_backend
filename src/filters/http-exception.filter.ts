import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = exception.getStatus();
        const res = exception.getResponse();

        const error =
            typeof res === 'string' ? { message: res } : (res as any);

        response.status(status).json({
            status: 'error',
            message: error.message || 'Error desconocido',
        });
    }
}
