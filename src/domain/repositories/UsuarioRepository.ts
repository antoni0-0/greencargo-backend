import { Usuario } from '../entities/Usuario';

export interface UsuarioRepository {
  create(usuario: Usuario): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
}
