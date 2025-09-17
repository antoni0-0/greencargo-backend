export interface EnvioEmailData {
  usuarioNombre: string;
  usuarioEmail: string;
  envioId: number;
  direccion: string;
  ciudad: string;
  departamento: string;
  peso: number;
  dimensiones: string;
  tipoProducto: string;
  fechaCreacion: string;
  estado: string;
}

export class EmailTemplates {
  static generateEnvioConfirmation(data: EnvioEmailData): { subject: string; html: string; text: string } {
    const subject = `✅ Confirmación de Envío #${data.envioId} - GreenCargo`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Envío</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .envio-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2ecc71; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; color: #555; }
        .info-value { color: #333; }
        .status { background: #e8f5e8; color: #2ecc71; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌱 GreenCargo</div>
            <h1>¡Envío Confirmado!</h1>
        </div>
        
        <div class="content">
            <p>Hola <strong>${data.usuarioNombre}</strong>,</p>
            
            <p>Tu envío ha sido registrado exitosamente en nuestro sistema. Aquí tienes los detalles:</p>
            
            <div class="envio-info">
                <h3>📦 Información del Envío</h3>
                <div class="info-row">
                    <span class="info-label">Número de Envío:</span>
                    <span class="info-value">#${data.envioId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tipo de Producto:</span>
                    <span class="info-value">${data.tipoProducto}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Peso:</span>
                    <span class="info-value">${data.peso} kg</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dimensiones:</span>
                    <span class="info-value">${data.dimensiones}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha de Creación:</span>
                    <span class="info-value">${data.fechaCreacion}</span>
                </div>
            </div>
            
            <div class="envio-info">
                <h3>📍 Dirección de Destino</h3>
                <div class="info-row">
                    <span class="info-label">Dirección:</span>
                    <span class="info-value">${data.direccion}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ciudad:</span>
                    <span class="info-value">${data.ciudad}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Departamento:</span>
                    <span class="info-value">${data.departamento}</span>
                </div>
            </div>
            
            <div class="status">
                Estado Actual: ${data.estado}
            </div>
            
            <p>Te mantendremos informado sobre el progreso de tu envío. ¡Gracias por elegir GreenCargo para tus necesidades de transporte ecológico!</p>
            
            <div class="footer">
                <p>🌱 GreenCargo - Transporte Sostenible</p>
                <p>Este es un correo automático, por favor no responder.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const text = `
CONFIRMACIÓN DE ENVÍO - GreenCargo

Hola ${data.usuarioNombre},

Tu envío ha sido registrado exitosamente en nuestro sistema.

INFORMACIÓN DEL ENVÍO:
- Número de Envío: #${data.envioId}
- Tipo de Producto: ${data.tipoProducto}
- Peso: ${data.peso} kg
- Dimensiones: ${data.dimensiones}
- Fecha de Creación: ${data.fechaCreacion}
- Estado Actual: ${data.estado}

DIRECCIÓN DE DESTINO:
- Dirección: ${data.direccion}
- Ciudad: ${data.ciudad}
- Departamento: ${data.departamento}

Te mantendremos informado sobre el progreso de tu envío.

¡Gracias por elegir GreenCargo!

🌱 GreenCargo - Transporte Sostenible
`;

    return { subject, html, text };
  }
}
