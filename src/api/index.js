const debug = require('debug')('odp:api');

const _ = require('lodash');
const bluebird = require('bluebird');
const Router = require('koa-router');
const xml2js = require('xml2js');

const OD = require('../orange-data');
const { OrangeDataError } = require('node-orangedata/lib/errors');

const router = new Router();

const xmlParser = new xml2js.Parser();
const xmlBuilder = new xml2js.Builder();

bluebird.promisifyAll(xmlParser);
bluebird.promisifyAll(xmlBuilder);

module.exports = router;

router.post('/newReceipt', (ctx) => {

    const { body } = ctx.request;

    const order = new OD.Order({
        id: body.request.id[0],
        inn: body.request.inn[0],
        group: body.request.group[0],
        type: Number(body.request.type[0]),
        customerContact: body.request.customerContact[0],
        taxationSystem: Number(body.request.taxationSystem[0])
    });

    order
        .addPosition({
            text: body.request.position[0].text[0],
            quantity: Number(body.request.position[0].quantity[0]),
            price: Number(body.request.position[0].price[0]),
            tax: Number(body.request.position[0].tax[0]),
            paymentMethodType: Number(body.request.position[0].paymentMethodType[0]),
            paymentSubjectType: Number(body.request.position[0].paymentSubjectType[0]),
            nomenclatureCode: body.request.position[0].nomenclatureCode[0]
        })
        .addPayment({
            type: Number(body.request.payment[0].type[0]),
            amount: Number(body.request.payment[0].amount[0])
        });


    return OD.agent.sendOrder(order)
        .then((status) => {

            ctx.body = xmlBuilder.buildObject({"response": 'ok'});

        })
        .catch(err => {

            let msg = err.toString();

            if (err instanceof OrangeDataError) {

                msg = msg + ' (' + err.errors + ')';
            }

            debug(msg);

            ctx.body =  xmlBuilder.buildObject(
                {"response":
                    {"error": msg}
                });

        });


});

router.get('/receiptStatus/:inn/:id', (ctx) => {

    return OD.agent.getOrderStatus(ctx.params.inn, ctx.params.id)
        .then((status) => {

            ctx.body = xmlBuilder.buildObject({"response": status});

        })
        .catch(err => {

            let msg = err.toString();

            if (err instanceof OrangeDataError) {

                msg = msg + ' (' + err.errors + ')';
            }

            ctx.body =  xmlBuilder.buildObject(
                {"response":
                    {"error": msg}
                });

        });

});