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
    const { data, error } =
      await this.supabaseService.cliente.auth.signInWithPassword({
        email,
        password,
      });

    if (error?.status === 400 || error?.status === 401) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (error || !data.session) {
      throw new InternalServerErrorException(
        'No se pudo iniciar la sesión en Supabase',
      );
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
}
