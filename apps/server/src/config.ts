import dotenv from 'dotenv';
import bunyan from 'bunyan';

dotenv.config();

class Config {
  public PORT = process.env.PORT;
  public NODE_ENV = process.env.NODE_ENV;
  public CLIENT_URL = process.env.CLIENT_URL;
  public DATABASE_URL = process.env.DATABASE_URL;
  public REDIS_URL = process.env.REDIS_URL;

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined || value === null) {
        throw new Error(`${key} env is not defined.`);
      }
    }
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({
      name: name,
      level: 'debug'
    });
  }
}

export const config: Config = new Config();
