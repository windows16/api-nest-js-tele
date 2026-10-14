import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from '../../database/supabase.service.js';

@Injectable()
export class SupabaseAuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async iniciarSesion(email: string, password: string) {
    const clienteAuth = this.supabaseService.crearClienteAuth();
    const { data, error } =
      await clienteAuth.auth.signInWithPassword({
        email,
        password,
      });

    if (error?.status === 400 || error?.status === 401) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (error || !data.session) {
      throw new InternalServerErrorException(error?.message);
    }

    return {
      access_token: data.session.access_token,
      token_type: data.session.token_type,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  async refrescarSesion(refreshToken: string) {
    const clienteAuth = this.supabaseService.crearClienteAuth();
    const { data, error } =
      await clienteAuth.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (error || !data.session) {
      throw new UnauthorizedException('Sesión expirada o refresh token inválido');
    }

    return {
      access_token: data.session.access_token,
      token_type: data.session.token_type,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  async obtenerUsuarioPorToken(tokenAcceso: string): Promise<User> {
    const { data: datos, error: errorSupabase } =
      await this.supabaseService.cliente.auth.getUser(tokenAcceso);

    if (errorSupabase || !datos.user) {
      throw errorSupabase ?? new Error('Supabase no devolvió un usuario autenticado');
    }

    return datos.user;
  }

  async cerrarSesion(tokenAcceso: string): Promise<{ mensaje: string }> {
    // Usar 'local' para revocar solo el access token actual.
    // 'global' invalida TODAS las sesiones del usuario (incluido el refresh token),
    // lo que causa "Auth session missing!" si el navegador guarda cookies de la sesion anterior.
    const { error } = await this.supabaseService.cliente.auth.admin.signOut(
      tokenAcceso,
      'local',
    );

    if (error) {
      // Si el token ya expiro, Supabase puede devolver error; no es critico para el cliente.
      throw new InternalServerErrorException(error.message);
    }

    return { mensaje: 'Sesion cerrada correctamente' };
  }
}
