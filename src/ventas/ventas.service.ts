import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service.js';
import type { AgregarProductoVentaDto } from './dto/agregar-producto-venta.dto.js';
import type { CrearVentaBaseDto } from './dto/crear-venta-base.dto.js';
import type { CreateVentaDto } from './dto/create-venta.dto.js';

type VentaRpcResult = {
  id: string;
  fecha: string;
  cliente_id: string;
  total: number;
  detalles: Array<{
    id: string;
    producto_id: string;
    cantidad: number;
    precio: number;
  }>;
};

@Injectable()
export class VentasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listar(
    clienteId?: string,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    let consulta = this.supabaseService.cliente
      .from('ventas')
      .select(
        `
        id,
        fecha,
        cliente_id,
        cliente:clientes (
          id,
          nombre,
          correo
        ),
        detalles:detalle_venta (
          cantidad,
          precio
        )
      `,
      )
      .order('fecha', { ascending: false });

    if (clienteId) consulta = consulta.eq('cliente_id', clienteId);
    if (fechaDesde) consulta = consulta.gte('fecha', `${fechaDesde}T00:00:00.000Z`);
    if (fechaHasta) consulta = consulta.lt('fecha', `${fechaHasta}T23:59:59.999Z`);

    const { data, error } = await consulta;
    if (error) {
      throw new InternalServerErrorException('No se pudieron consultar las ventas');
    }

    return data.map((venta) => ({
      id: venta.id,
      fecha: venta.fecha,
      cliente_id: venta.cliente_id,
      cliente: venta.cliente,
      total: Number(
        (venta.detalles ?? [])
          .reduce(
            (total, detalle) =>
              total + Number(detalle.precio) * detalle.cantidad,
            0,
          )
          .toFixed(2),
      ),
    }));
  }

  async crearVenta(datos: CrearVentaBaseDto) {
    const { data, error } = await this.supabaseService.cliente
      .from('ventas')
      .insert({ cliente_id: datos.clienteId })
      .select('id, fecha, cliente_id')
      .single();

    if (error?.code === '23503') {
      throw new NotFoundException('Cliente no encontrado');
    }
    if (error) {
      throw new InternalServerErrorException('No se pudo crear la venta');
    }
    return { ...data, total: 0, detalles: [] };
  }

  async agregarProducto(ventaId: string, datos: AgregarProductoVentaDto) {
    const { data, error } = await this.supabaseService.cliente.rpc(
      'agregar_producto_venta',
      {
        p_venta_id: ventaId,
        p_producto_id: datos.productoId,
        p_cantidad: datos.cantidad,
      },
    );

    if (error?.code === 'P0001') {
      throw new BadRequestException(error.message);
    }
    if (error?.code === '23503') {
      throw new NotFoundException('Venta o producto no encontrado');
    }
    if (error) {
      throw new InternalServerErrorException(
        'No se pudo agregar el producto a la venta',
      );
    }
    return data;
  }

  async obtenerTotal(ventaId: string) {
    const { data, error } = await this.supabaseService.cliente
      .from('ventas')
      .select(
        `
        id,
        fecha,
        cliente_id,
        cliente:clientes (
          id,
          nombre,
          correo
        ),
        detalles:detalle_venta (
          id,
          producto_id,
          cantidad,
          precio,
          producto:productos (
            id,
            nombre
          )
        )
      `,
      )
      .eq('id', ventaId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo consultar la venta completa',
      );
    }
    if (!data) {
      throw new NotFoundException('Venta no encontrada');
    }

    const detalles = data.detalles ?? [];
    const total = detalles.reduce(
      (acumulado, detalle) =>
        acumulado + Number(detalle.precio) * detalle.cantidad,
      0,
    );

    return {
      ...data,
      total: Number(total.toFixed(2)),
    };
  }

  async crear(datos: CreateVentaDto): Promise<VentaRpcResult> {
    const productos = new Map<string, number>();
    for (const detalle of datos.productos) {
      if (productos.has(detalle.productoId)) {
        throw new BadRequestException(
          'No se puede repetir un producto dentro de la venta',
        );
      }
      productos.set(detalle.productoId, detalle.cantidad);
    }

    const { data, error } = await this.supabaseService.cliente.rpc(
      'crear_venta',
      {
        p_cliente_id: datos.clienteId,
        p_detalles: datos.productos.map((detalle) => ({
          producto_id: detalle.productoId,
          cantidad: detalle.cantidad,
        })),
      },
    );

    if (error?.code === 'P0001') {
      throw new BadRequestException(error.message);
    }
    if (error?.code === '23503') {
      throw new NotFoundException('Cliente o producto no encontrado');
    }
    if (error) {
      throw new InternalServerErrorException('No se pudo crear la venta');
    }

    return data as VentaRpcResult;
  }
}
