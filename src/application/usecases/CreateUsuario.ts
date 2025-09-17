import bcrypt from 'bcrypt';
import { Usuario, CreateUsuarioRequest } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';

export class CreateUsuario {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async execute(request: CreateUsuarioRequest): Promise<Usuario> {
    if (!request.nombre || !request.email || !request.password) {
      throw new Error('Nombre, email y password son requeridos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Formato de email inválido');
    }

    if (request.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const existingUser = await this.usuarioRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(request.password, saltRounds);

    const usuario: Usuario = {
      nombre: request.nombre,
      email: request.email,
      password_hash,
      rol: request.rol || 'cliente'
    };

    const createdUsuario = await this.usuarioRepository.create(usuario);
    
    const { password_hash: _, ...usuarioResponse } = createdUsuario;
    return usuarioResponse as Usuario;
  }
}
