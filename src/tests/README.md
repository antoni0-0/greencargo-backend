# Tests para GreenCargo Backend

## Estructura de Tests

### Tests Unitarios (`src/tests/unit/`)
- `jwt.test.ts` - Tests para utilidades JWT
- `CreateUsuario.test.ts` - Tests para caso de uso de creación de usuario
- `LoginUsuario.test.ts` - Tests para caso de uso de login
- `addressValidation.test.ts` - Tests para validación de direcciones colombianas

### Tests de Integración (`src/tests/integration/`)
- `UsuarioRepository.test.ts` - Tests de integración para repositorio de usuarios
- `auth.test.ts` - Tests de integración para endpoints de autenticación
- `CreateEnvio.test.ts` - Tests de integración para caso de uso de creación de envío

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## Configuración

Los tests están configurados con:
- Jest como framework de testing
- ts-jest para soporte de TypeScript
- Supertest para tests de integración HTTP
- Mocks para dependencias externas (base de datos, bcrypt, etc.)

## Cobertura

Los tests cubren:
- ✅ Validación de datos de entrada
- ✅ Lógica de negocio de casos de uso
- ✅ Utilidades JWT
- ✅ Validación de direcciones colombianas
- ✅ Endpoints de autenticación
- ✅ Repositorios con mocks
