import * as AWS from 'aws-sdk';
import { fromTicks, toTicks } from './utils';
import { PullResult } from './interfaces';

export const handler = async (event: any, context: any, callback: any) => {
    const client = new AWS.DynamoDB.DocumentClient();
    const body = Object.assign({}, event.queryStringParameters, event.pathParameters);
    console.log(body);
    const ticks = toTicks(body.date);

    client.get({
        TableName: 'djei_raw',
        Key: {
            ticks
        }
    }, (err, data) => {
        console.log(err, data);
        if (err) {
            callback(err, null);
        }

        const result = data.Item as PullResult;
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
        callback(null, response);
    });
};
