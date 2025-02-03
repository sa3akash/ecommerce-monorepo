import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import os from 'os';
import { globalErrorHandler, ServerError } from 'error-express';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

import { config } from '@/config';
import mainRoute from '@/routes';

export class SetupServer {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandlerFn(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1)
    app.use(
      cors({
        origin: (requestOrigin, callback) => {
          const allowedOrigins = [config.CLIENT_URL!];
          if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
            throw new ServerError('Request block by cors', 400);
          }
          callback(null, allowedOrigins); // allowedOrigin or true
        },
        credentials: true,
        optionsSuccessStatus: 204,
        maxAge: 6000,
        preflightContinue: false
      })
    );
    app.use(helmet());
    app.use(hpp());
    // app.use(cookieParser());
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(express.json({ limit: '100MB' }));
    app.use(express.urlencoded({ extended: true, limit: '500MB' }));
  }

  private routesMiddleware(app: Application): void {
    mainRoute(app);
  }

  private globalErrorHandlerFn(app: Application): void {
    app.get('/', (req, res) => {
      res.json({ message: 'All Ok!', os: os.hostname() });
    });
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Routes not found!' });
    });
    app.use(globalErrorHandler);
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      path: '/socket.io',
      cors: {
        // origin: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });

    const pubClient = createClient({ url: config.REDIS_URL! });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startServer(app: Application): void {
    const httpServer = http.createServer(app);
    httpServer.listen(config.PORT, async () => {
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.socketIoConnection(socketIO);
      console.log(`STARTING SERVER ON PORT ${config.PORT} PROCESS ID =${process.pid}`);
    });
  }

  private socketIoConnection(io: Server): void {
    // const postSocketHandler: SocketIoPostHandler = new SocketIoPostHandler(io);
    // listen
    // postSocketHandler.listen();
  }
}
