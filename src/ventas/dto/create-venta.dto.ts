import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreateDetalleVentaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productoId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CreateVentaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  clienteId!: string;

  @ApiProperty({ type: [CreateDetalleVentaDto] })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  productos!: CreateDetalleVentaDto[];
}
