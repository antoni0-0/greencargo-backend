import Database from 'better-sqlite3';
import { Usuario } from '../../../domain/entities/Usuario';
import { UsuarioRepository } from '../../../domain/repositories/UsuarioRepository';
import { openDb } from '../database';

export class UsuarioRepositoryImpl implements UsuarioRepository {
  private db: Database.Database;

  constructor() {
    this.db = openDb();
  }

  async create(usuario: Usuario): Promise<Usuario> {
    const stmt = this.db.prepare(`
      INSERT INTO Usuario (nombre, email, password_hash, rol)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      usuario.nombre,
      usuario.email,
      usuario.password_hash,
      usuario.rol
    );

    const createdUsuario = await this.findById(result.lastInsertRowid as number);
    if (!createdUsuario) {
      throw new Error('Error al crear el usuario');
    }

    return createdUsuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const stmt = this.db.prepare('SELECT * FROM Usuario WHERE email = ?');
    const row = stmt.get(email) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      password_hash: row.password_hash,
      rol: row.rol,
      fecha_registro: row.fecha_registro
    };
  }

  async findById(id: number): Promise<Usuario | null> {
    const stmt = this.db.prepare('SELECT * FROM Usuario WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      password_hash: row.password_hash,
      rol: row.rol,
      fecha_registro: row.fecha_registro
    };
  }
}
