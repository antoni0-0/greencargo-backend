export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  database: {
    path: process.env.DATABASE_PATH || 'database.sqlite'
  }
};
