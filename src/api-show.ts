import * as AWS from 'aws-sdk';
import config from './config';

import { toTicks, formatResult, applyInterval } from './utils';
import { PullResult } from './interfaces';

const client = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any, context: any, callback: any) => {
    try {
        const body = Object.assign({}, event.queryStringParameters, event.pathParameters);
        console.log(`Input:`, body);

        const ticks = toTicks(body.date);

        client.get({
            TableName: config.dbTable,
            Key: {
                ticks
            }
        }, (err, data) => {

            console.log(`DynamoDB GET:`, err, data);
            if (err) {
                return callback(err, null);
            }

            const result = data.Item as PullResult;

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

        });
    } catch (err) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: err.message
            })
        });
    }
};
