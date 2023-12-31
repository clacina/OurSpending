import express from 'express';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dns from 'node:dns';

// Hack to use module type (newer)
// https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import resourcesRouter from './routes/resources.js';
import reportsRouter from './routes/reports.js';

var app = express();
app.listen(8000);
dns.setDefaultResultOrder('ipv4first');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

import cors from 'cors';

const whitelist = ["http://localhost:3000"]
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
}
app.use(cors(corsOptions))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/resources', resourcesRouter);
app.use('/reports', reportsRouter);
// app.use('/login', );
// app.use('/logout', );
// app.use('/signup', );

export default app;
