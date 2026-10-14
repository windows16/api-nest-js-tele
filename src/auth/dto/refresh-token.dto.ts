import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token emitido por Supabase durante el login',
    example: 'refresh-token-string',
  })
  @IsString({ message: 'El refreshToken debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El refreshToken no puede estar vacío' })
  refreshToken!: string;
}
