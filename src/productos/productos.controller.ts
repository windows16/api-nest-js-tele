import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { ProductosService } from './productos.service.js';

@ApiTags('Productos')
@ApiBearerAuth('supabase-jwt')
@Controller('v1/productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}
  @Post() @ApiOperation({ summary: 'Crea un producto' }) crear(@Body() datos: CreateProductoDto) { return this.productosService.crear(datos); }
  @Get() @ApiOperation({ summary: 'Consulta todos los productos' }) listar() { return this.productosService.listar(); }
  @Get(':id') @ApiOperation({ summary: 'Consulta un producto' }) obtener(@Param('id', ParseUUIDPipe) id: string) { return this.productosService.obtener(id); }
  @Patch(':id') @ApiOperation({ summary: 'Modifica un producto' }) actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() datos: UpdateProductoDto) { return this.productosService.actualizar(id, datos); }
  @Delete(':id') @ApiOperation({ summary: 'Elimina un producto' }) eliminar(@Param('id', ParseUUIDPipe) id: string) { return this.productosService.eliminar(id); }
}
