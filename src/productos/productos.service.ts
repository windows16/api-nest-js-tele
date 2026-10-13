import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service.js';
import type { CreateProductoDto } from './dto/create-producto.dto.js';
import type { UpdateProductoDto } from './dto/update-producto.dto.js';

@Injectable()
export class ProductosService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async crear(datos: CreateProductoDto) {
    const { data, error } = await this.supabaseService.cliente.from('productos').insert(datos).select().single();
    if (error) throw new InternalServerErrorException('No se pudo crear el producto');
    return data;
  }
  async listar() {
    const { data, error } = await this.supabaseService.cliente.from('productos').select('*').order('nombre');
    if (error) throw new InternalServerErrorException('No se pudieron consultar los productos');
    return data;
  }
  async obtener(id: string) {
    const { data, error } = await this.supabaseService.cliente.from('productos').select('*').eq('id', id).maybeSingle();
    if (error) throw new InternalServerErrorException('No se pudo consultar el producto');
    if (!data) throw new NotFoundException('Producto no encontrado');
    return data;
  }
  async actualizar(id: string, datos: UpdateProductoDto) {
    await this.obtener(id);
    const { data, error } = await this.supabaseService.cliente.from('productos').update(datos).eq('id', id).select().single();
    if (error) throw new InternalServerErrorException('No se pudo actualizar el producto');
    return data;
  }
  async eliminar(id: string) {
    await this.obtener(id);
    const { error } = await this.supabaseService.cliente.from('productos').delete().eq('id', id);
    if (error?.code === '23503') throw new NotFoundException('No se puede eliminar un producto vendido');
    if (error) throw new InternalServerErrorException('No se pudo eliminar el producto');
    return { mensaje: 'Producto eliminado correctamente' };
  }
}
