import Database from 'better-sqlite3';
import { Direccion } from '../../../domain/entities/Direccion';
import { DireccionRepository } from '../../../domain/repositories/DireccionRepository';
import { openDb } from '../database';

export class DireccionRepositoryImpl implements DireccionRepository {
  private db: Database.Database;

  constructor() {
    this.db = openDb();
  }

  async create(direccion: Direccion): Promise<Direccion> {
    const stmt = this.db.prepare(`
      INSERT INTO Direccion (direccion, detalle, ciudad, departamento, codigo_postal, pais)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      direccion.direccion,
      direccion.detalle,
      direccion.ciudad,
      direccion.departamento,
      direccion.codigo_postal,
      direccion.pais
    );

    const createdDireccion = await this.findById(result.lastInsertRowid as number);
    if (!createdDireccion) {
      throw new Error('Error al crear la dirección');
    }

    return createdDireccion;
  }

  async findById(id: number): Promise<Direccion | null> {
    const stmt = this.db.prepare('SELECT * FROM Direccion WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      direccion: row.direccion,
      detalle: row.detalle,
      ciudad: row.ciudad,
      departamento: row.departamento,
      codigo_postal: row.codigo_postal,
      pais: row.pais
    };
  }
}
