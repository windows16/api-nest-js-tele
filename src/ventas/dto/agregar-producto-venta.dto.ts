import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AgregarProductoVentaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productoId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  cantidad!: number;
}
