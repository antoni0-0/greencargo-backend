import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { generateToken, JwtPayload } from '../../shared/utils/jwt';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    fecha_registro: string;
  };
}

export class LoginUsuario {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    if (!request.email || !request.password) {
      throw new Error('Email y password son requeridos');
    }

    const usuario = await this.usuarioRepository.findByEmail(request.email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(request.password, usuario.password_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      userId: usuario.id!,
      email: usuario.email,
      rol: usuario.rol
    };

    const token = generateToken(payload);

    return {
      token,
      usuario: {
        id: usuario.id!,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro!
      }
    };
  }
}
