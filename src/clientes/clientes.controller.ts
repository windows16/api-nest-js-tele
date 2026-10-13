import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { ClientesService } from './clientes.service.js';

@ApiTags('Clientes')
@ApiBearerAuth('supabase-jwt')
@Controller('v1/clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un cliente' })
  crear(@Body() datos: CreateClienteDto) { return this.clientesService.crear(datos); }

  @Get()
  @ApiOperation({ summary: 'Consulta todos los clientes' })
  listar() { return this.clientesService.listar(); }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta un cliente' })
  obtener(@Param('id', ParseUUIDPipe) id: string) { return this.clientesService.obtener(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifica un cliente' })
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() datos: UpdateClienteDto) {
    return this.clientesService.actualizar(id, datos);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un cliente' })
  eliminar(@Param('id', ParseUUIDPipe) id: string) { return this.clientesService.eliminar(id); }
}
