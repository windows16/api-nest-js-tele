import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly cliente: SupabaseClient;

  private readonly urlSupabase: string;
  private readonly claveRolServicio: string;

  constructor(servicioConfiguracion: ConfigService) {
    this.urlSupabase = servicioConfiguracion.get<string>('SUPABASE_URL') || '';
    this.claveRolServicio =
      servicioConfiguracion.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!this.urlSupabase || !this.claveRolServicio) {
      throw new Error(
        'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas',
      );
    }

    this.cliente = createClient(this.urlSupabase, this.claveRolServicio, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Crea un cliente efímero para operaciones de autenticación de usuario (login, refresh).
   * Esto evita contaminar la instancia singleton `this.cliente` con la sesión del usuario.
   */
  crearClienteAuth(): SupabaseClient {
    return createClient(this.urlSupabase, this.claveRolServicio, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
