import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ServerConfig } from './config/config';
import { router } from './router/apiRouter';

const app = express();
const { host, port } = ServerConfig.get();

app.use(bodyParser.json());
app.use('/api/', router);

app.listen(port, host, () => console.log(`Server listens http://${host}:${port}`));