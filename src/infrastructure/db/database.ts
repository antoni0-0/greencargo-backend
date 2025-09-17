import Database from 'better-sqlite3';

let testDb: Database.Database | null = null;

export function setTestDatabase(db: Database.Database): void {
  testDb = db;
}

export function openDb(): Database.Database {
  if (process.env.NODE_ENV === 'test' && testDb) {
    return testDb;
  }
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

  const insertStates = db.prepare(`
    INSERT OR IGNORE INTO Estado (id, descripcion) VALUES 
    (0, 'En espera'),
    (1, 'En tránsito'),
    (2, 'Entregado')
  `);
  insertStates.run();

  const insertVehicles = db.prepare(`
    INSERT OR IGNORE INTO Vehiculo (id, placa, tipo, capacidad) VALUES 
    (1, 'ABC-123', 'camion', 5000.0),
    (2, 'DEF-456', 'furgon', 2000.0),
    (3, 'GHI-789', 'moto', 50.0),
    (4, 'JKL-012', 'bicicleta', 20.0)
  `);
  insertVehicles.run();

  const insertRoutes = db.prepare(`
    INSERT OR IGNORE INTO Ruta (id, descripcion, fecha_hora_inicio, estado) VALUES 
    (1, 'Ruta Norte - Bogotá a Medellín', '2024-01-20 08:00:00', 'planificada'),
    (2, 'Ruta Sur - Bogotá a Cali', '2024-01-20 10:00:00', 'planificada'),
    (3, 'Ruta Centro - Bogotá a Bucaramanga', '2024-01-20 14:00:00', 'planificada'),
    (4, 'Ruta Local - Bogotá Centro', '2024-01-20 16:00:00', 'planificada')
  `);
  insertRoutes.run();
  
const insertTransportista = db.prepare(`
  INSERT OR IGNORE INTO Usuario (id, nombre, email, password_hash, rol) VALUES 
  (1, 'Transportista 1', 'transportista@greencargo.com', '$2b$10$rQZ8K9vL2nF5mH8jP3qWCOY7xK2nF5mH8jP3qWCOY7xK2nF5mH8jP', 'transportista'),
  (2, 'Transportista 2', 'transportista2@greencargo.com', '$2b$10$rQZ8K9vL2nF5mH8jP3qWCOY7xK2nF5mH8jP3qWCOY7xK2nF5mH8jP', 'transportista'),
  (3, 'Transportista 3', 'transportista3@greencargo.com', '$2b$10$rQZ8K9vL2nF5mH8jP3qWCOY7xK2nF5mH8jP3qWCOY7xK2nF5mH8jP', 'transportista'),
  (4, 'Transportista 4', 'transportista4@greencargo.com', '$2b$10$rQZ8K9vL2nF5mH8jP3qWCOY7xK2nF5mH8jP3qWCOY7xK2nF5mH8jP', 'transportista')
`);
insertTransportista.run();

  const insertTransportistas = db.prepare(`
    INSERT OR IGNORE INTO Transportista (id, id_usuario, id_vehiculo, disponibilidad) VALUES 
    (1, 1, 1, 1),
    (2, 2, 2, 1),
    (3, 3, 3, 1),
    (4, 4, 4, 1)
  `);
  insertTransportistas.run();
}