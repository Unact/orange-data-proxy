const debug = require('debug')('odp:server');
const Koa = require('koa');
const bodyParser = require('koa-body');

const _ = require('lodash');

const app = new Koa();
const {port} = require('../cfg/orange-data-proxy').server;

const api = require('./api/index');
api.prefix('/api');

debug('starting on port', port);

app
    .use(bodyParser())
    .use(api.routes())
    .use(api.allowedMethods())
    .listen(port);