import path from 'path';

import express from 'express';
import 'express-async-errors';
import * as bodyParser from 'body-parser';
import history from 'connect-history-api-fallback';

import { router } from './views';
import { errorHandler } from './error';
import { getLogger } from './logging';
import { loadKey } from './permission';
import { syncDatabase } from './models';
import { HTTP_PORT } from './config';

const app = express();

app.use(bodyParser.json());

app.use('/api', router);

const staticFileMiddleware = express.static(path.join('dist/public'));
app.use(staticFileMiddleware);
app.use(history({ disableDotRule: true }));
app.use(staticFileMiddleware);
app.get('/', function (req, res) {
  res.render(path.join('dist/public/index.html'));
});

app.use(errorHandler);

(async () => {
  await loadKey();
  await syncDatabase();
  app.listen(HTTP_PORT, () => {
    getLogger('express').info(`Server is running on port ${HTTP_PORT}`);
  });
})();
