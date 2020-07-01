import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import * as cors from 'cors';
import { ServerConfig } from './config/config';
import { router } from './router/apiRouter';
import { errorResponse, StatusCode } from './common/responseSender';

const app = express();
const { host, port, sessionSecret, redisClient } = ServerConfig.get();
const RedisStore = connectRedis(session);

app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
app.use(bodyParser.json());
app.use(session({
    cookie: {
        httpOnly: true,
        maxAge: 3600 * 24 * 1000
    },
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret,
    unset: 'destroy',
    store: new RedisStore({ client: redisClient })
}));
app.use('/api/', router);
app.use('*', (req, res) => errorResponse(req, res, StatusCode.NOT_FOUND, new Error('Not Found')));

app.listen(port, host, () => console.log(`Server listens http://${host}:${port}`));