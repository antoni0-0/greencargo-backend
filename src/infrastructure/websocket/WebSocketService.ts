import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { JwtPayload, verifyToken } from '../../shared/utils/jwt';

export interface EnvioStatusUpdate {
  envioId: number;
  usuarioId: number;
  estadoAnterior: {
    id: number;
    descripcion: string;
  };
  estadoNuevo: {
    id: number;
    descripcion: string;
  };
  fechaActualizacion: string;
  mensaje: string;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<number, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      let token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (token && token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '');
      }
      
      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }
      
      try {
        console.log('WebSocket token:', token);
        const decoded = verifyToken(token);
        (socket as any).user = decoded;
        console.log('WebSocket user authenticated:', decoded.email);
        next();
      } catch (error) {
        console.log('WebSocket auth error:', error);
        next(new Error('Token inválido'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as JwtPayload;
      
      console.log(`Usuario ${user.userId} (${user.email}) conectado via WebSocket`);
      
      this.connectedUsers.set(user.userId, socket.id);
      
      socket.join(`user_${user.userId}`);
      
      if (user.rol === 'admin') {
        socket.join('admins');
      }

      socket.on('disconnect', () => {
        console.log(`Usuario ${user.userId} desconectado`);
        this.connectedUsers.delete(user.userId);
      });

      socket.on('subscribe_envio', (envioId: number) => {
        socket.join(`envio_${envioId}`);
        console.log(`Usuario ${user.userId} suscrito a actualizaciones del envío ${envioId}`);
      });

      socket.on('unsubscribe_envio', (envioId: number) => {
        socket.leave(`envio_${envioId}`);
        console.log(`Usuario ${user.userId} desuscrito de actualizaciones del envío ${envioId}`);
      });
    });
  }

  public broadcastEnvioStatusUpdate(update: EnvioStatusUpdate): void {
    const { envioId, usuarioId } = update;
    
    this.io.to(`user_${usuarioId}`).emit('envio_status_update', update);
    
    this.io.to(`envio_${envioId}`).emit('envio_status_update', update);
    
    this.io.to('admins').emit('envio_status_update', update);
    
    console.log(`Actualización de estado enviada para envío ${envioId}: ${update.estadoAnterior.descripcion} → ${update.estadoNuevo.descripcion}`);
  }

  public sendNotificationToUser(userId: number, notification: any): void {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  public sendNotificationToAdmins(notification: any): void {
    this.io.to('admins').emit('admin_notification', notification);
  }

  public getConnectionStats(): { totalConnections: number; connectedUsers: number[] } {
    return {
      totalConnections: this.io.sockets.sockets.size,
      connectedUsers: Array.from(this.connectedUsers.keys())
    };
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
