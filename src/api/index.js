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

    debug(ctx);

    debug(body);
    debug(body.request.content[0]);

    const order = new OD.Order({
        id: body.request.id[0],
        inn: body.request.inn[0],
        group: 'Main',
        type: 1
    });

    order
        .addPosition({
            text: 'test',
            quantity: 5,
            price: 10,
            tax: 1,
            paymentMethodType: 1,
            paymentSubjectType: 1,
            nomenclatureCode: 'igQVAAADMTIzNDU2Nzg5MDEyMwAAAQ==',
            supplierINN: '3123011520',
            supplierInfo: { phoneNumbers: ['+79998887766'], name: 'Наименование поставщика' },
        })
        .addPayment({ type: 1, amount: 10 })
        .addPayment({ type: 2, amount: 40 })
        .addAgent({
            agentType: 127,
            paymentTransferOperatorPhoneNumbers: ['+79998887766'],
            paymentAgentOperation: 'Операция агента',
            paymentAgentPhoneNumbers: ['+79998887766'],
            paymentOperatorPhoneNumbers: ['+79998887766'],
            paymentOperatorName: 'Наименование оператора перевода',
            paymentOperatorAddress: 'Адрес оператора перевода',
            paymentOperatorINN: '3123011520',
            supplierPhoneNumbers: ['+79998887766'],
        })
        .addUserAttribute({
            name: 'citation',
            value: 'В здоровом теле здоровый дух, этот лозунг еще не потух!',
        });

    debug(order);

    return OD.agent.sendOrder(order)
        .then((status) => {

            debug(status);

            ctx.body = xmlBuilder.buildObject({"response": "created"});

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

            debug(status);

            ctx.body = xmlBuilder.buildObject({"response": status});

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