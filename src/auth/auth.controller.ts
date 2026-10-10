import {
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { SupabaseAuthService } from './services/supabase-auth.service.js';

@ApiTags('Autenticación')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: SupabaseAuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Inicia sesión y obtiene un token Bearer',
    description:
      'Autentica al usuario en Supabase. Usa el access_token devuelto como Bearer en las rutas protegidas.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada correctamente.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: 1735689600,
        refresh_token: 'refresh-token',
        user: { id: 'usuario-id', email: 'usuario@ejemplo.com' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  iniciarSesion(@Body() datos: LoginDto) {
    return this.authService.iniciarSesion(datos.email, datos.password);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Cierra la sesión del usuario autenticado',
    description:
      'Revoca la sesión y el refresh token en Supabase. El cliente debe eliminar también el access_token almacenado.',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  cerrarSesion(@Headers('authorization') autorizacion: string) {
    const token = autorizacion.trim().split(/\s+/)[1];
    return this.authService.cerrarSesion(token);
  }
}
