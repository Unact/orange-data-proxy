const fs = require('fs');
const { OrangeData, Order } = require('node-orangedata');

const cert = fs.readFileSync('./keys/client.crt');
const key = fs.readFileSync('./keys/client.key');
const passphrase = '1234';
const ca = fs.readFileSync('./keys/cacert.pem');
const privateKey = fs.readFileSync('./keys/private_key.pem');
const { apiUrl }= require('../cfg/orange-data-proxy').orangedata;

const agent = new OrangeData({ apiUrl, cert, key, passphrase, ca, privateKey });

module.exports.agent = agent;
module.exports.Order = Order;