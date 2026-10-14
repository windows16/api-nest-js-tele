import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SupabaseAuthService } from './services/supabase-auth.service.js';
import type { User } from '@supabase/supabase-js';

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
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async iniciarSesion(
    @Body() datos: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sesion = await this.authService.iniciarSesion(datos.email, datos.password);

    res.cookie('nest_access_token', sesion.access_token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días para evitar que el navegador la borre de golpe
      path: '/',
    });

    if (sesion.refresh_token) {
      res.cookie('nest_refresh_token', sesion.refresh_token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
        path: '/',
      });
    }

    return sesion;
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Renueva el access token usando un refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token renovado correctamente.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado.' })
  async refrescarSesion(
    @Body() datos: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sesion = await this.authService.refrescarSesion(datos.refreshToken);

    res.cookie('nest_access_token', sesion.access_token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    if (sesion.refresh_token) {
      res.cookie('nest_refresh_token', sesion.refresh_token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }

    return sesion;
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtiene el usuario autenticado' })
  obtenerUsuario(@CurrentUser() usuario: User) {
    return usuario;
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Cierra la sesión del usuario autenticado',
    description:
      'Revoca la sesión y el refresh token en Supabase. El cliente debe eliminar también el access_token almacenado.',
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente.' })
  @ApiResponse({ status: 401, description: 'Token ausente o inválido.' })
  async cerrarSesion(
    @Headers('authorization') autorizacion?: string,
    @Req() req?: Request,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const token =
      autorizacion?.trim().split(/\s+/)[1] ??
      (req as any)?.cookies?.['nest_access_token'] ??
      '';

    res?.clearCookie('nest_access_token', { path: '/' });
    res?.clearCookie('nest_refresh_token', { path: '/' });

    if (token) {
      return this.authService.cerrarSesion(token);
    }
    return { mensaje: 'Sesión cerrada correctamente' };
  }
}
