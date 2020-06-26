import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import { ServerConfig } from './config/config';
import { router } from './router/apiRouter';
import { errorResponse, StatusCode } from './common/responseSender';

const app = express();
const { host, port, sessionSecret } = ServerConfig.get();

app.use(bodyParser.json());
app.use(session({
    cookie: {
        httpOnly: true,
        maxAge: 3600 * 24
    },
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret,
    unset: 'destroy'
}));
app.use('/api/', router);
app.use('*', (req, res) => errorResponse(req, res, StatusCode.NOT_FOUND, new Error('Not Found')));

app.listen(port, host, () => console.log(`Server listens http://${host}:${port}`));