import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service.js';
import type { CreateClienteDto } from './dto/create-cliente.dto.js';
import type { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async  crear(datos: CreateClienteDto) {
    const { data, error } = await this.supabaseService.cliente
      .from('clientes')
      .insert(datos)
      .select()
      .single();
    this.comprobarError(error, error?.message || "error al crear cliente");
    return data;
  }

  async listar() {
    const { data, error } = await this.supabaseService.cliente
      .from('clientes')
      .select('*')
      .order('nombre');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async obtener(id: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('clientes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Cliente no encontrado');
    return data;
  }

  async actualizar(id: string, datos: UpdateClienteDto) {
    await this.obtener(id);
    const { data, error } = await this.supabaseService.cliente
      .from('clientes')
      .update(datos)
      .eq('id', id)
      .select()
      .single();
    this.comprobarError(error, 'No se pudo actualizar el cliente');
    return data;
  }

  async eliminar(id: string) {
    await this.obtener(id);
    const { error } = await this.supabaseService.cliente
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error?.code === '23503') {
      throw new ConflictException('No se puede eliminar un cliente con ventas');
    }
    if (error) throw new InternalServerErrorException(error.message);
    return { mensaje: 'Cliente eliminado correctamente' };
  }

  private comprobarError(error: { code?: string } | null, mensaje: string): void {
    if (error?.code === '23505') throw new ConflictException('El correo ya está registrado');
    if (error) throw new InternalServerErrorException(mensaje);
  }
}
