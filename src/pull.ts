import axios from 'axios';
import * as $ from 'cheerio';
import * as AWS from 'aws-sdk';

import { extractWhenUpdated, formatPermit, getToday, parseDate } from './utils';
import { PullResult, Processes } from './interfaces';

export const pull = async (): Promise<PullResult> => {
    const url = 'https://www.djei.ie/en/What-We-Do/Jobs-Workplace-and-Skills/Employment-Permits/Current-Application-Processing-Dates/';
    const today = getToday();
    const response = await axios.get(url);
    const body = $.load(response.data);
    const processes: Processes = { };

    const rows = body('article table tbody tr').toArray();
    for (const row of rows) {
        const name = formatPermit($('td:nth-child(1)', row).text());
        const date = $('td:nth-child(2)', row).text();
        processes[name] = parseDate(date, today).getTime();
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

    const client = new AWS.DynamoDB.DocumentClient();
    client.put({
        TableName: 'djei_raw',
        Item: result,
    }, (err, output) => {
        console.log(`DynamoDB Put:`, err, output);
        if (err) {
            return callback(err);
        } else {
            return callback(null, output);
        }
    });
};
