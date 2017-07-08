import * as AWS from 'aws-sdk';
import config from './config';

import { toTicks, formatResults, applyInterval, range } from './utils';
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
            return resolve(data.Item as PullResult);
        });
    });
};

export const handler = async (event: any, context: any, callback: any) => {
    try {
        const body = Object.assign({}, event.queryStringParameters, event.pathParameters);
        console.log(`Input:`, body);

        let results: PullResult[];
        if (body.date === 'now') {
            results = [ await pull() ];
        } else {
            const ticks = toTicks(body.date);
            const values = range(ticks, body.interval);
            results = await Promise.all(values.map(getByTicks));
        }

        if (results && results.length > 0) {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify(formatResults(results, body.format))
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
