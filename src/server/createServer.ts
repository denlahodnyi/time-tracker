import express from 'express';

import { errorHandler, logger } from '../middlewares/index.js';
import router from '../routes/index.js';

const createServer = (): express.Application => {
  const app = express();

  app.use(logger());
  app.use(express.json());
  app.use('/api', router);
  app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Not found' });
  });
  app.use(errorHandler);

  return app;
};

export default createServer;
