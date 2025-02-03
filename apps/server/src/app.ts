// external libraries
import express, { Express } from 'express';
// import cluster from 'cluster';

// custom files
import { SetupServer } from '@/setupServer';
import dbConnection from '@/setupDatabase';
import { config } from '@/config';

/**
 *
 * main server
 *
 */

class MainApplication {
  public initialize(): void {
    this.loadConfig();
    dbConnection();
    const app: Express = express();

    const server = new SetupServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

const application: MainApplication = new MainApplication();
application.initialize();

process.on('uncaughtException', (err: Error) => {
  console.log(`There was an uncaught error: ${err}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.log(`Unhandled rejection at: ${reason}`);
  process.exit(1);
});

// if (cluster.isPrimary) {
//   for (let i = 0; i < 4; i++) {
//     cluster.fork();
//   }
// } else {
//   application.initialize();
// }
