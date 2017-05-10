import axios from 'axios';
import * as $ from 'cheerio';
import * as AWS from 'aws-sdk';

import { extractWhenUpdated, getToday, parseDate } from './utils';

type ErrorHandler = (err: Error) => void;

const pull = async (url: string, tableName: string, errorHandler: ErrorHandler) => {
    try {
        const client = new AWS.DynamoDB.DocumentClient();
        const today = getToday();
        const response = await axios.get(url);
        const body = $.load(response.data);
        const rows = body('article table tbody tr').toArray();
        const updated = extractWhenUpdated(body('article p').text());
        const processes = [];

        for (const row of rows) {
            const name = $('td:nth-child(1)', row).text();
            const date = $('td:nth-child(2)', row).text();
            processes.push({
                name,
                date: parseDate(date, today)
            });
        }

        client.put({
            TableName: tableName,
            Item: {
                ticks: today.getTime(),
                updated: parseDate(updated, today),
                processes
            }
        }, (err: Error) => {
            if (err) {
                errorHandler(err);
            }
        });
    } catch (err) {
        errorHandler(err);
    }
};

export const handler = (event: any, context: any, callback: any) => {
    const tableName = 'mydjei_raw';
    const url = 'https://www.djei.ie/en/What-We-Do/Jobs-Workplace-and-Skills/Employment-Permits/Current-Application-Processing-Dates/';
    pull(url, tableName, callback);
};
