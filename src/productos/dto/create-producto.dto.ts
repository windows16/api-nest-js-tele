import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({ example: 'Teclado mecánico' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  nombre!: string;

  @ApiProperty({ example: 899.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio!: number;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(0)
  existencia!: number;
}
