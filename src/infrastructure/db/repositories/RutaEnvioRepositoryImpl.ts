import Database from 'better-sqlite3';
import { RutaEnvio, RutaEnvioResponse, TransportistaDisponible, RutaDisponible } from '../../../domain/entities/AsignarRuta';
import { RutaEnvioRepository } from '../../../domain/repositories/RutaEnvioRepository';
import { openDb } from '../database';

export class RutaEnvioRepositoryImpl implements RutaEnvioRepository {
  private db: Database.Database;

  constructor() {
    this.db = openDb();
  }

  async create(rutaEnvio: RutaEnvio): Promise<RutaEnvio> {
    const stmt = this.db.prepare(`
      INSERT INTO RutaEnvio (id_envio, id_ruta, id_transportista)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(
      rutaEnvio.id_envio,
      rutaEnvio.id_ruta,
      rutaEnvio.id_transportista
    );

    return {
      id: result.lastInsertRowid as number,
      id_envio: rutaEnvio.id_envio,
      id_ruta: rutaEnvio.id_ruta,
      id_transportista: rutaEnvio.id_transportista,
      fecha_asignacion: new Date().toISOString()
    };
  }

  async findById(id: number): Promise<RutaEnvioResponse | null> {
    const stmt = this.db.prepare(`
      SELECT 
        re.*,
        e.peso,
        e.volumen,
        e.tipo_producto,
        s.descripcion as estado_envio,
        r.descripcion as ruta_descripcion,
        r.fecha_hora_inicio,
        r.estado as ruta_estado,
        t.disponibilidad,
        v.placa,
        v.tipo,
        v.capacidad
      FROM RutaEnvio re
      JOIN Envio e ON re.id_envio = e.id
      JOIN Estado s ON e.id_estado_actual = s.id
      JOIN Ruta r ON re.id_ruta = r.id
      JOIN Transportista t ON re.id_transportista = t.id
      JOIN Vehiculo v ON t.id_vehiculo = v.id
      WHERE re.id = ?
    `);
    
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      id_envio: row.id_envio,
      id_ruta: row.id_ruta,
      id_transportista: row.id_transportista,
      fecha_asignacion: row.fecha_asignacion,
      envio: {
        id: row.id_envio,
        peso: row.peso,
        volumen: row.volumen,
        tipo_producto: row.tipo_producto,
        estado: row.estado_envio
      },
      ruta: {
        id: row.id_ruta,
        descripcion: row.ruta_descripcion,
        fecha_hora_inicio: row.fecha_hora_inicio,
        estado: row.ruta_estado
      },
      transportista: {
        id: row.id_transportista,
        disponibilidad: row.disponibilidad === 1,
        vehiculo: {
          id: row.id_vehiculo,
          placa: row.placa,
          tipo: row.tipo,
          capacidad: row.capacidad
        }
      }
    };
  }

  async findByEnvioId(envioId: number): Promise<RutaEnvioResponse | null> {
    const stmt = this.db.prepare(`
      SELECT 
        re.*,
        e.peso,
        e.volumen,
        e.tipo_producto,
        s.descripcion as estado_envio,
        r.descripcion as ruta_descripcion,
        r.fecha_hora_inicio,
        r.estado as ruta_estado,
        t.disponibilidad,
        v.placa,
        v.tipo,
        v.capacidad
      FROM RutaEnvio re
      JOIN Envio e ON re.id_envio = e.id
      JOIN Estado s ON e.id_estado_actual = s.id
      JOIN Ruta r ON re.id_ruta = r.id
      JOIN Transportista t ON re.id_transportista = t.id
      JOIN Vehiculo v ON t.id_vehiculo = v.id
      WHERE re.id_envio = ?
    `);
    
    const row = stmt.get(envioId) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      id_envio: row.id_envio,
      id_ruta: row.id_ruta,
      id_transportista: row.id_transportista,
      fecha_asignacion: row.fecha_asignacion,
      envio: {
        id: row.id_envio,
        peso: row.peso,
        volumen: row.volumen,
        tipo_producto: row.tipo_producto,
        estado: row.estado_envio
      },
      ruta: {
        id: row.id_ruta,
        descripcion: row.ruta_descripcion,
        fecha_hora_inicio: row.fecha_hora_inicio,
        estado: row.ruta_estado
      },
      transportista: {
        id: row.id_transportista,
        disponibilidad: row.disponibilidad === 1,
        vehiculo: {
          id: row.id_vehiculo,
          placa: row.placa,
          tipo: row.tipo,
          capacidad: row.capacidad
        }
      }
    };
  }

  async getTransportistasDisponibles(): Promise<TransportistaDisponible[]> {
    const stmt = this.db.prepare(`
      SELECT 
        t.id,
        t.disponibilidad,
        v.id as id_vehiculo,
        v.placa,
        v.tipo,
        v.capacidad
      FROM Transportista t
      JOIN Vehiculo v ON t.id_vehiculo = v.id
      WHERE t.disponibilidad = 1
    `);
    
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      disponibilidad: row.disponibilidad === 1,
      vehiculo: {
        id: row.id_vehiculo,
        placa: row.placa,
        tipo: row.tipo,
        capacidad: row.capacidad
      }
    }));
  }

  async getRutasDisponibles(): Promise<RutaDisponible[]> {
    const stmt = this.db.prepare(`
      SELECT id, descripcion, fecha_hora_inicio, estado
      FROM Ruta
      WHERE estado = 'planificada'
    `);
    
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      descripcion: row.descripcion,
      fecha_hora_inicio: row.fecha_hora_inicio,
      estado: row.estado
    }));
  }

  async verificarDisponibilidadTransportista(transportistaId: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT disponibilidad FROM Transportista WHERE id = ?
    `);
    
    const row = stmt.get(transportistaId) as any;
    return row && row.disponibilidad === 1;
  }

  async verificarCapacidadVehiculo(transportistaId: number, peso: number, volumen: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      SELECT v.capacidad
      FROM Transportista t
      JOIN Vehiculo v ON t.id_vehiculo = v.id
      WHERE t.id = ?
    `);
    
    const row = stmt.get(transportistaId) as any;
    
    if (!row) {
      return false;
    }

    return peso <= row.capacidad;
  }
}
