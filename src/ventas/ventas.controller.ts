import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateVentaDto } from './dto/create-venta.dto.js';
import { AgregarProductoVentaDto } from './dto/agregar-producto-venta.dto.js';
import { CrearVentaBaseDto } from './dto/crear-venta-base.dto.js';
import { VentasService } from './ventas.service.js';

@ApiTags('Ventas')
@ApiBearerAuth('supabase-jwt')
@Controller('v1/ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post('base')
  @ApiOperation({ summary: 'Crea una venta sin productos' })
  crearVenta(@Body() datos: CrearVentaBaseDto) {
    return this.ventasService.crearVenta(datos);
  }

  @Post(':ventaId/productos')
  @ApiOperation({ summary: 'Agrega un producto a una venta' })
  @ApiBody({ type: AgregarProductoVentaDto })
  agregarProducto(
    @Param('ventaId', ParseUUIDPipe) ventaId: string,
    @Body() datos: AgregarProductoVentaDto,
  ) {
    return this.ventasService.agregarProducto(ventaId, datos);
  }

  @Get(':ventaId/total')
  @ApiOperation({ summary: 'Obtiene una venta completa con su total' })
  @ApiResponse({
    status: 200,
    description: 'Venta, cliente, productos del detalle y total calculado.',
    schema: {
      example: {
        id: 'venta-id',
        fecha: '2026-10-10T03:20:00.000Z',
        cliente_id: 'cliente-id',
        cliente: {
          id: 'cliente-id',
          nombre: 'Ana Pérez',
          correo: 'ana@ejemplo.com',
        },
        detalles: [
          {
            id: 'detalle-id',
            producto_id: 'producto-id',
            cantidad: 2,
            precio: 899.99,
            producto: { id: 'producto-id', nombre: 'Teclado mecánico' },
          },
        ],
        total: 1799.98,
      },
    },
  })
  obtenerTotal(@Param('ventaId', ParseUUIDPipe) ventaId: string) {
    return this.ventasService.obtenerTotal(ventaId);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una venta y calcula su total' })
  @ApiBody({ type: CreateVentaDto })
  @ApiResponse({ status: 201, description: 'Venta creada y existencia descontada.' })
  crear(@Body() datos: CreateVentaDto) {
    return this.ventasService.crear(datos);
  }
}
