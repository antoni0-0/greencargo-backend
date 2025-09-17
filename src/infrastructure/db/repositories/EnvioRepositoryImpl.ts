import Database from 'better-sqlite3';
import { Envio, EnvioResponse, EstadoEnvioHistorial } from '../../../domain/entities/Envio';
import { EnvioRepository } from '../../../domain/repositories/EnvioRepository';
import { openDb } from '../database';

export class EnvioRepositoryImpl implements EnvioRepository {
  private db: Database.Database;

  constructor() {
    this.db = openDb();
  }

  async create(envio: Envio): Promise<Envio> {
    const stmt = this.db.prepare(`
      INSERT INTO Envio (id_usuario, id_direccion, id_estado_actual, peso, largo, ancho, alto, volumen, tipo_producto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      envio.id_usuario,
      envio.id_direccion,
      envio.id_estado_actual,
      envio.peso,
      envio.largo,
      envio.ancho,
      envio.alto,
      envio.volumen,
      envio.tipo_producto
    );

    const estadoStmt = this.db.prepare(`
      INSERT INTO EstadoEnvio (id_envio, id_estado, comentario)
      VALUES (?, ?, ?)
    `);
    estadoStmt.run(result.lastInsertRowid, envio.id_estado_actual, 'Estado inicial del envío');

    const createdEnvio = await this.findById(result.lastInsertRowid as number);
    if (!createdEnvio) {
      throw new Error('Error al crear el envío');
    }

    return {
      id: result.lastInsertRowid as number,
      id_usuario: envio.id_usuario,
      id_direccion: envio.id_direccion,
      id_estado_actual: envio.id_estado_actual,
      peso: envio.peso,
      largo: envio.largo,
      ancho: envio.ancho,
      alto: envio.alto,
      volumen: envio.volumen,
      tipo_producto: envio.tipo_producto,
      fecha_creacion: new Date().toISOString()
    };
  }

  async findById(id: number): Promise<EnvioResponse | null> {
    const stmt = this.db.prepare(`
      SELECT 
        e.*,
        d.direccion,
        d.detalle,
        d.ciudad,
        d.departamento,
        d.codigo_postal,
        d.pais,
        s.descripcion as estado_descripcion,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM Envio e
      JOIN Direccion d ON e.id_direccion = d.id
      JOIN Estado s ON e.id_estado_actual = s.id
      JOIN Usuario u ON e.id_usuario = u.id
      WHERE e.id = ?
    `);
    
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      id_usuario: row.id_usuario,
      id_direccion: row.id_direccion,
      id_estado_actual: row.id_estado_actual,
      peso: row.peso,
      largo: row.largo,
      ancho: row.ancho,
      alto: row.alto,
      volumen: row.volumen,
      tipo_producto: row.tipo_producto,
      fecha_creacion: row.fecha_creacion,
      direccion: {
        id: row.id_direccion,
        direccion: row.direccion,
        detalle: row.detalle,
        ciudad: row.ciudad,
        departamento: row.departamento,
        codigo_postal: row.codigo_postal,
        pais: row.pais
      },
      estado: {
        id: row.id_estado_actual,
        descripcion: row.estado_descripcion
      }
    };
  }

  async updateEstado(id: number, estado: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE Envio SET id_estado_actual = ? WHERE id = ?
    `);
    return stmt.run(estado, id).changes > 0;
  }

  async findByUsuarioId(usuarioId: number): Promise<EnvioResponse[]> {
    const stmt = this.db.prepare(`
      SELECT 
        e.*,
        d.direccion,
        d.detalle,
        d.ciudad,
        d.departamento,
        d.codigo_postal,
        d.pais,
        s.descripcion as estado_descripcion,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM Envio e
      JOIN Direccion d ON e.id_direccion = d.id
      JOIN Estado s ON e.id_estado_actual = s.id
      JOIN Usuario u ON e.id_usuario = u.id
      WHERE e.id_usuario = ?
      ORDER BY e.fecha_creacion DESC
    `);
    
    const rows = stmt.all(usuarioId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      id_usuario: row.id_usuario,
      id_direccion: row.id_direccion,
      id_estado_actual: row.id_estado_actual,
      peso: row.peso,
      largo: row.largo,
      ancho: row.ancho,
      alto: row.alto,
      volumen: row.volumen,
      tipo_producto: row.tipo_producto,
      fecha_creacion: row.fecha_creacion,
      direccion: {
        id: row.id_direccion,
        direccion: row.direccion,
        detalle: row.detalle,
        ciudad: row.ciudad,
        departamento: row.departamento,
        codigo_postal: row.codigo_postal,
        pais: row.pais
      },
      estado: {
        id: row.id_estado_actual,
        descripcion: row.estado_descripcion
      },
      usuario: {
        id: row.id_usuario,
        nombre: row.usuario_nombre,
        email: row.usuario_email
      }
    }));
  }

  async getAllEnvios(estadoId?: number): Promise<EnvioResponse[]> {
    let query = `
      SELECT 
        e.*,
        d.direccion,
        d.detalle,
        d.ciudad,
        d.departamento,
        d.codigo_postal,
        d.pais,
        s.descripcion as estado_descripcion,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM Envio e
      JOIN Direccion d ON e.id_direccion = d.id
      JOIN Estado s ON e.id_estado_actual = s.id
      JOIN Usuario u ON e.id_usuario = u.id
    `;
    
    const params: any[] = [];
    
    if (estadoId !== undefined) {
      query += ` WHERE e.id_estado_actual = ?`;
      params.push(estadoId);
    }
    
    query += ` ORDER BY e.fecha_creacion DESC`;
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(row => ({
      id: row.id,
      id_usuario: row.id_usuario,
      id_direccion: row.id_direccion,
      id_estado_actual: row.id_estado_actual,
      peso: row.peso,
      largo: row.largo,
      ancho: row.ancho,
      alto: row.alto,
      volumen: row.volumen,
      tipo_producto: row.tipo_producto,
      fecha_creacion: row.fecha_creacion,
      direccion: {
        id: row.id_direccion,
        direccion: row.direccion,
        detalle: row.detalle,
        ciudad: row.ciudad,
        departamento: row.departamento,
        codigo_postal: row.codigo_postal,
        pais: row.pais
      },
      estado: {
        id: row.id_estado_actual,
        descripcion: row.estado_descripcion
      },
      usuario: {
        id: row.id_usuario,
        nombre: row.usuario_nombre,
        email: row.usuario_email
      }
    }));
  }

  async getHistorialEstados(envioId: number): Promise<EstadoEnvioHistorial[]> {
    const stmt = this.db.prepare(`
      SELECT 
        ee.id,
        ee.id_envio,
        ee.id_estado,
        ee.fecha_cambio,
        ee.comentario,
        e.descripcion as estado_descripcion
      FROM EstadoEnvio ee
      JOIN Estado e ON ee.id_estado = e.id
      WHERE ee.id_envio = ?
      ORDER BY ee.fecha_cambio ASC
    `);
    
    const rows = stmt.all(envioId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      id_envio: row.id_envio,
      id_estado: row.id_estado,
      fecha_cambio: row.fecha_cambio,
      comentario: row.comentario,
      estado: {
        id: row.id_estado,
        descripcion: row.estado_descripcion
      }
    }));
  }

  async saveEstadoEnvio(envioId: number, estadoId: number, comentario?: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      INSERT INTO EstadoEnvio (id_envio, id_estado, comentario) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(envioId, estadoId, comentario);
    return result.changes > 0;
  }
}
