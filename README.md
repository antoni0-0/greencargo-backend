# GreenCargo Backend

Backend API para el sistema de gestión de envíos GreenCargo, desarrollado con Node.js, TypeScript y arquitectura hexagonal.

## 🚀 Características

- **Arquitectura Hexagonal**: Separación clara entre dominio, aplicación e infraestructura
- **Autenticación JWT**: Sistema seguro de autenticación de usuarios
- **Gestión de Envíos**: CRUD completo para envíos con seguimiento de estados
- **Sistema de Colas**: Procesamiento asíncrono de emails con Redis/Bull
- **WebSockets**: Notificaciones en tiempo real
- **Base de Datos SQLite**: Persistencia de datos con Better-SQLite3
- **Validación de Direcciones**: Validación automática de direcciones de envío
- **Testing**: Suite completa de tests unitarios e integración
- **Cobertura de Código**: Reportes de cobertura con Jest

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- TypeScript >= 5.0.0

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/antoni0-0/greencargo-backend.git
   cd greencargo-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Servidor
   PORT=3000
   NODE_ENV=development
   
   # Base de datos
   DATABASE_PATH=database.sqlite
   
   # JWT
   JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
   JWT_EXPIRES_IN=10m
   
   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-password-de-aplicacion
   SMTP_FROM=tu-email@gmail.com
   ```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Testing
```bash
# Todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📚 API Endpoints

### Autenticación
- `POST /api/usuarios/register` - Registro de usuario
- `POST /api/usuarios/login` - Inicio de sesión

### Envíos
- `GET /api/envios` - Listar envíos del usuario
- `POST /api/envios` - Crear nuevo envío
- `GET /api/envios/:id` - Obtener envío por ID
- `PUT /api/envios/:id/estado` - Actualizar estado del envío

### Rutas
- `GET /api/rutas` - Listar rutas disponibles
- `POST /api/rutas/asignar` - Asignar ruta a envío

### Sistema
- `GET /health` - Estado del servidor y servicios

## 🏗️ Arquitectura

```
src/
├── application/          # Casos de uso
│   └── usecases/
├── domain/              # Entidades y repositorios
│   ├── entities/
│   └── repositories/
├── infrastructure/      # Implementaciones concretas
│   ├── config/
│   ├── db/
│   ├── queue/
│   ├── services/
│   ├── web/
│   └── websocket/
├── shared/             # Utilidades compartidas
│   ├── errors/
│   └── utils/
└── tests/              # Tests
    ├── integration/
    ├── unit/
    └── mocks/
```

## 🔧 Tecnologías

- **Runtime**: Node.js
- **Lenguaje**: TypeScript
- **Framework**: Express.js
- **Base de Datos**: SQLite (Better-SQLite3)
- **Autenticación**: JWT
- **Colas**: Sistema de colas personalizado
- **WebSockets**: Socket.io
- **Testing**: Jest + Supertest
- **Validación**: Validación personalizada de direcciones

## 📊 Estados de Envío

1. **Pendiente** - Envío creado, esperando procesamiento
2. **En Tránsito** - Envío en camino
3. **Entregado** - Envío completado exitosamente
4. **Cancelado** - Envío cancelado

## 🔐 Autenticación

El sistema utiliza JWT para autenticación. Incluye el token en el header:
```
Authorization: Bearer <tu-jwt-token>
```

## 📧 Sistema de Emails

- Envío automático de notificaciones por email
- Procesamiento asíncrono con sistema de colas
- Templates personalizables para diferentes tipos de notificaciones

## 🧪 Testing

El proyecto incluye una suite completa de tests:

- **Tests Unitarios**: Casos de uso y utilidades
- **Tests de Integración**: Endpoints y flujos completos
- **Mocks**: Simulaciones de servicios externos
- **Cobertura**: Reportes HTML en `/coverage`

## 📈 Monitoreo

- Endpoint `/health` para verificar estado del servidor
- Estadísticas de WebSocket en tiempo real
- Estado de colas de procesamiento

