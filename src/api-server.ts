import cors from 'cors';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import cacheControl from 'express-cache-controller';
import {Server, Errors} from 'typescript-rest';

export class ApiServer {
  public PORT: number = Number(process.env.PORT) || 3000;

  private readonly app: express.Application;
  private server: http.Server | null = null;

  constructor() {
    this.app = express();
    this.config();

    Server.loadServices(this.app, 'controllers/*', __dirname);

    this.handleErrors();
  }

  public async start() {
    return new Promise<any>((resolve, reject) => {
      this.server = this.app.listen(this.PORT, (err: any) => {
        if (err) {
          return reject(err);
        }

        console.log(`Listening to http://127.0.0.1:${this.PORT}`);

        return resolve();
      });
    });
  }

  public async stop(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  }

  private config(): void {
    this.app.use(cors());
    this.app.use(morgan('combined'));
    this.app.use('/docs', express.static('docs'));
    this.app.use('/static', express.static('public'));
    this.app.get('/', (_, res) => {
      res.redirect('/docs');
    });

    if (process.env.NODE_ENV === 'production') {
      this.app.use(cacheControl({
        public: true,
        maxAge: 5 * 60 // 5 minutes
      }));
    }
  }

  private handleErrors(): void {
    this.app.use((error: any, _: express.Request, res: express.Response, next: express.NextFunction) => {
      console.log('error handler', error);
      if (error instanceof Errors.HttpError) {
        if (res.headersSent) {
          return next(error);
        }

        res.set('content-type', 'application/json');
        res.status(error.statusCode);
        res.json({error: error.message, code: error.statusCode});
      } else {
        next(error);
      }
    });
  }
}
