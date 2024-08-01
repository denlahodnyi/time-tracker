import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler, logger } from '../middlewares/index.js';
import router from '../routes/index.js';
import { createErrorResponse } from '../core/helpers/index.js';
import { env } from '../../env.js';

const corsOptions: cors.CorsOptions = {
  // allows cross-origin HTTP requests to include credentials
  credentials: true,
  origin: true,
};

if (env.NODE_ENV === 'production') {
  corsOptions.credentials = false;
  corsOptions.origin = env.CORS_ORIGIN;
}

const createServer = (): express.Application => {
  const app = express();

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(logger());
  app.use('/api', router);
  app.use((req, res) => {
    res
      .status(404)
      .json(
        createErrorResponse({ code: 404, message: 'Endpoint was not found' }),
      );
  });
  app.use(errorHandler);

  return app;
};

export default createServer;
