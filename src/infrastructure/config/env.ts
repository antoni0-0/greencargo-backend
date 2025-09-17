export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '10m'
  },
  database: {
    path: process.env.DATABASE_PATH || 'database.sqlite'
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER
    }
  }
};