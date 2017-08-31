import * as AWS from 'aws-sdk';
import config from './config';
import axios from 'axios';
import * as $ from 'cheerio';

import { extractWhenUpdated, formatPermit, getToday, parseDate, sanitize } from './utils';
import { PullResult, Processes } from './interfaces';

const client = new AWS.DynamoDB.DocumentClient();

export const pull = async (): Promise<PullResult> => {
    const today = getToday();
    const response = await axios.get(config.djeiUrl);
    const body = $.load(response.data);
    const processes: Processes = { };

    const rows = body('article table tbody tr').toArray();
    for (const row of rows) {
        const header = $('thead tr th:nth-child(1)', row.parent.parent).text();
        const content = $('td:nth-child(1)', row).text();
        const date = $('td:nth-child(2)', row).text();

        const name = formatPermit(header, content);
        if (date && name) {
            processes[name] = parseDate(date, today).getTime();
        }
    }

    const updated = extractWhenUpdated(body('article p').text());
    return {
        ticks: today.getTime(),
        updated: parseDate(updated, today).getTime(),
        processes
    };
};

export const handler = async (event: any, context: any, callback: any) => {
    const result = await pull();
    console.log(`Pull Result:`, result);

    client.put({
        TableName: config.dbTable,
        Item: result,
    }, (err, output) => {
        console.log(`DynamoDB PUT:`, err, output);
        if (err) {
            return callback(err);
        } else {
            return callback(null, output);
        }
    });
};
