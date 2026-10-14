import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { SupabaseAuthService } from '../services/supabase-auth.service.js';

export type AuthenticatedRequest = Request & {
  user?: User;
  organizacionId?: string;
};

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: SupabaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const solicitud =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    let token: string | undefined;

    // 1. Extraer desde la cabecera Authorization (Bearer <token>)
    const autorizacion = solicitud.headers.authorization?.trim();
    if (autorizacion) {
      let authLimpia = autorizacion;
      while (/^bearer\s+bearer\s+/i.test(authLimpia)) {
        authLimpia = authLimpia.replace(/^bearer\s+/i, '');
      }

      const [esquema, tokenExtraido, ...partesAdicionales] = authLimpia.split(/\s+/);
      if (esquema?.toLowerCase() === 'bearer' && tokenExtraido && partesAdicionales.length === 0) {
        token = tokenExtraido;
      }
    }

    // 2. Extraer desde cookies parseadas por cookie-parser
    if (!token && solicitud.cookies) {
      token =
        solicitud.cookies['nest_access_token'] ||
        solicitud.cookies['access_token'];
    }

    // 3. Extraer desde cabecera cookie raw (fallback)
    if (!token && solicitud.headers.cookie) {
      const match = solicitud.headers.cookie.match(
        /(?:^|;\s*)(?:nest_access_token|access_token)=([^;]+)/,
      );
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      throw new UnauthorizedException('Token Bearer ausente o mal formado');
    }

    try {
      solicitud.user = await this.authService.obtenerUsuarioPorToken(token);
    } catch {
      throw new UnauthorizedException('Token de acceso inválido');
    }

    return true;
  }
}
