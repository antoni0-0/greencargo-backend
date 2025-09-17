import Database from 'better-sqlite3';

export function openDb(): Database.Database {
  return new Database('database.sqlite');
}

export function initDb() {
  const db = openDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS Usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL CHECK (rol IN ('cliente', 'transportista', 'admin')) DEFAULT 'cliente',
      fecha_registro DATETIME DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS Direccion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direccion TEXT NOT NULL,
      detalle TEXT,
      ciudad TEXT NOT NULL,
      departamento TEXT NOT NULL,
      codigo_postal TEXT,
      pais TEXT NOT NULL DEFAULT 'Colombia'
    );

    CREATE TABLE IF NOT EXISTS Estado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Vehiculo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placa TEXT UNIQUE NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('camion', 'furgon', 'moto', 'bicicleta')),
      capacidad REAL NOT NULL CHECK (capacidad > 0)
    );

    CREATE TABLE IF NOT EXISTS Transportista (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      id_vehiculo INTEGER NOT NULL,
      disponibilidad BOOLEAN NOT NULL DEFAULT TRUE,
      FOREIGN KEY (id_usuario) REFERENCES Usuario(id) ON DELETE CASCADE,
      FOREIGN KEY (id_vehiculo) REFERENCES Vehiculo(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS Envio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      id_direccion INTEGER NOT NULL,
      id_estado_actual INTEGER NOT NULL,
      peso REAL NOT NULL CHECK (peso > 0),
      largo REAL NOT NULL CHECK (largo > 0),
      ancho REAL NOT NULL CHECK (ancho > 0),
      alto REAL NOT NULL CHECK (alto > 0),
      volumen REAL NOT NULL CHECK (volumen > 0),
      tipo_producto TEXT NOT NULL,
      fecha_creacion DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (id_usuario) REFERENCES Usuario(id) ON DELETE CASCADE,
      FOREIGN KEY (id_direccion) REFERENCES Direccion(id) ON DELETE RESTRICT,
      FOREIGN KEY (id_estado_actual) REFERENCES Estado(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS EstadoEnvio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_envio INTEGER NOT NULL,
      id_estado INTEGER NOT NULL,
      fecha_cambio DATETIME DEFAULT (datetime('now')),
      comentario TEXT,
      FOREIGN KEY (id_envio) REFERENCES Envio(id) ON DELETE CASCADE,
      FOREIGN KEY (id_estado) REFERENCES Estado(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS Ruta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descripcion TEXT NOT NULL,
      fecha_hora_inicio DATETIME NOT NULL,
      fecha_hora_fin DATETIME,
      estado TEXT DEFAULT 'planificada' CHECK (estado IN ('planificada', 'en_progreso', 'completada', 'cancelada'))
    );

    CREATE TABLE IF NOT EXISTS RutaEnvio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_envio INTEGER NOT NULL,
      id_ruta INTEGER NOT NULL,
      id_transportista INTEGER NOT NULL,
      fecha_asignacion DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (id_envio) REFERENCES Envio(id) ON DELETE CASCADE,
      FOREIGN KEY (id_ruta) REFERENCES Ruta(id) ON DELETE CASCADE,
      FOREIGN KEY (id_transportista) REFERENCES Transportista(id) ON DELETE RESTRICT,
      UNIQUE(id_envio, id_ruta)
    );

    CREATE INDEX IF NOT EXISTS idx_usuario_email ON Usuario(email);
    CREATE INDEX IF NOT EXISTS idx_envio_usuario ON Envio(id_usuario);
    CREATE INDEX IF NOT EXISTS idx_envio_estado ON Envio(id_estado_actual);
    CREATE INDEX IF NOT EXISTS idx_estado_envio_envio ON EstadoEnvio(id_envio);
    CREATE INDEX IF NOT EXISTS idx_transportista_usuario ON Transportista(id_usuario);
    CREATE INDEX IF NOT EXISTS idx_transportista_vehiculo ON Transportista(id_vehiculo);
    CREATE INDEX IF NOT EXISTS idx_ruta_envio_envio ON RutaEnvio(id_envio);
    CREATE INDEX IF NOT EXISTS idx_ruta_envio_ruta ON RutaEnvio(id_ruta);
    CREATE INDEX IF NOT EXISTS idx_ruta_envio_transportista ON RutaEnvio(id_transportista);
  `);
}