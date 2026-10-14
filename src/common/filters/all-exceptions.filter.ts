import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Filtro global de excepciones.
 *
 * - Loguea el error COMPLETO (mensaje + stack trace) en la consola del servidor.
 * - Devuelve una respuesta JSON estructurada y consistente al cliente.
 *
 * Registro visual en consola:
 *   [AllExceptionsFilter] POST /api/v1/auth/login → 401
 *   Mensaje : Credenciales inválidas
 *   Stack   : UnauthorizedException: Credenciales inválidas
 *               at SupabaseAuthService.iniciarSesion (...)
 *               ...
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ── Determinar status y mensaje ─────────────────────────────────────────
    let status: number;
    let message: string | string[];
    let errorName: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        message = (responseBody as { message: string | string[] }).message;
      } else {
        message = exception.message;
      }

      errorName = exception.constructor.name;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Error interno del servidor';
      errorName = exception.constructor.name;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error desconocido';
      errorName = 'UnknownError';
    }

    // ── Log completo en consola del servidor ───────────────────────────────
    const metodo = request.method;
    const url = request.url;
    const logPrefix = `${metodo} ${url} → ${status}`;

    if (status >= 500) {
      // Errores de servidor: log completo con stack trace
      this.logger.error(
        `${logPrefix}\nMensaje : ${Array.isArray(message) ? message.join(', ') : message}\nStack   : ${(exception instanceof Error ? exception.stack : String(exception)) ?? 'Sin stack'}`,
      );
    } else {
      // Errores de cliente (4xx): log en warn con stack completo en modo debug
      this.logger.warn(
        `${logPrefix} [${errorName}] ${Array.isArray(message) ? message.join(', ') : message}`,
      );
      // Stack trace visible en desarrollo
      if (process.env.NODE_ENV !== 'production' && exception instanceof Error && exception.stack) {
        this.logger.debug(`Stack:\n${exception.stack}`);
      }
    }

    // ── Respuesta estructurada al cliente ──────────────────────────────────
    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      path: url,
      timestamp: new Date().toISOString(),
    });
  }
}
