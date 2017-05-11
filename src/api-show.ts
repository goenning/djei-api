import * as AWS from 'aws-sdk';
import { fromTicks, toTicks } from './utils';
import { PullResult } from './interfaces';

export const handler = async (event: any, context: any, callback: any) => {
    try {
        const client = new AWS.DynamoDB.DocumentClient();
        const body = Object.assign({}, event.queryStringParameters, event.pathParameters);
        console.log(`Input:`, body);

        const ticks = toTicks(body.date);

        client.get({
            TableName: 'djei_raw',
            Key: {
                ticks
            }
        }, (err: any, data: any) => {

            console.log(`DynamoDB Get:`, err, data);
            if (err) {
                return callback(err, null);
            }

            const result = data.Item as PullResult;

            if (result) {
                const response = {
                    statusCode: 200,
                    body: JSON.stringify({
                        date: fromTicks(result.ticks, body.format),
                        updated: fromTicks(result.updated, body.format),
                        processes: Object.keys(result.processes).map((name, idx) => {
                            return {
                                name,
                                date: fromTicks(result.processes[name], body.format)
                            };
                        })
                    })
                };
                return callback(null, response);
            } else {
                return callback(null, { statusCode: 404 });
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
