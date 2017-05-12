import * as AWS from 'aws-sdk';
import config from './config';

import { toTicks, formatResult, applyInterval } from './utils';
import { pull } from './pull';
import { PullResult } from './interfaces';

const client = new AWS.DynamoDB.DocumentClient();

const getByTicks = (ticks: number): Promise<PullResult> => {
    return new Promise((resolve, reject) => {
        client.get({
            TableName: config.dbTable,
            Key: {
                ticks
            }
        }, (err, data) => {
            console.log(`DynamoDB GET:`, err, data);
            if (err) {
                return reject(err);
            }
            return resolve(data.Item);
        });
    });
};

export const handler = async (event: any, context: any, callback: any) => {
    try {
        const body = Object.assign({}, event.queryStringParameters, event.pathParameters);
        console.log(`Input:`, body);

        let result: PullResult;
        if (body.date === 'now') {
            result = await pull();
        } else {
            const ticks = toTicks(body.date);
            result = await getByTicks(ticks);
        }

        if (result) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(formatResult(result, body.format))
            });
        } else {
            return callback(null, {
                statusCode: 404
            });
        }
    } catch (err) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: err.message
            })
        });
    }
};
