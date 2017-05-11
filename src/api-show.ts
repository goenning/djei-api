import * as AWS from 'aws-sdk';
import { fromTicks, toTicks } from './utils';
import { PullResult } from './interfaces';

export const handler = async (event: any, context: any, callback: any) => {
    const client = new AWS.DynamoDB.DocumentClient();
    const body = Object.assign({}, event.queryStringParameters, event.pathParameters);
    console.log(`Input:`, body);

    let ticks = 0;
    try {
        ticks = toTicks(body.date);
    } catch (ex) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: `'${body.date}' is not a valid date.`
            })
        });
    }

    client.get({
        TableName: 'djei_raw',
        Key: {
            ticks
        }
    }, (err, data) => {

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
};
