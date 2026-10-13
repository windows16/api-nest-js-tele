import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CrearVentaBaseDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  clienteId!: string;
}
