import { PullResult } from './interfaces';

export const sanitize = (input: string | null) => {
    let sanitized = '';

    if (input) {
        input = input.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        for (let i = 0; i < input.length; i++) {
            const ascii = input.charCodeAt(i);
            if ((ascii >= 48 && ascii <= 57) ||  // numbers
                (ascii >= 65 && ascii <= 90) ||  // uppercase letters
                (ascii >= 97 && ascii <= 122)) { // lowercase letters
                sanitized += input[i];
            } else {
                sanitized += ' ';
            }
        }
    }

    return sanitized;
};

export const extractWhenUpdated = (input: string) => {
    const regex = /As of (.*?), we/gm;
    const matches = regex.exec(input);
    if (matches) {
        return sanitize(matches[1]);
    }
    return '';
};

const months: {[key: string]: number} = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12
};

function twoDigits(n: number) {
    return n > 9 ? '' + n : '0' + n;
}

export const getToday = () => {
    const n = new Date();
    return new Date(`${n.getUTCFullYear()}-${twoDigits(n.getUTCMonth() + 1)}-${twoDigits(n.getUTCDate())}T00:00:00.000Z`);
};

export const parseDate = (input: string, relativeDate: Date) => {
    input = sanitize(input).replace(/\s+/g, '');
    const parts = /(\d+)([a-zA-Z]*)(\d*)/g.exec(input) || [];
    let year = sanitize(parts[3]);
    const month = months[parts[2].substring(0, 3)];
    const day = parseInt(parts[1], 10);

    if (!year) {
        if (month > relativeDate.getMonth() + 1) {
            year = (relativeDate.getFullYear() - 1).toString();
        } else {
            year = relativeDate.getFullYear().toString();
        }
    } else if (year.length !== 4) {
        year = (2000 + parseInt(year, 10)).toString();
    }

    return new Date(`${year}-${twoDigits(month)}-${twoDigits(day)}T00:00:00.000Z`);
};

export const formatResults = (results: PullResult[], format: string) => {
    return results.map((r) => formatResult(r, format)).filter((r) => r);
};

export const formatResult = (result: PullResult, format: string) => {
    if (!result) {
        return null;
    }

    return {
        date: fromTicks(result.ticks, format),
        updated: fromTicks(result.updated, format),
        processes: Object.keys(result.processes).map((name, idx) => {
            return {
                name,
                date: fromTicks(result.processes[name], format)
            };
        })
    };
};

export const formatPermit = (header: string, content: string) => {
    header = sanitize(header).replace(/\s+/g, ' ');
    content = sanitize(content).replace(/\s+/g, ' ');

    switch (content) {
        case 'Trusted Partner': return 'trusted';
        case 'Standard': return 'standard';
    }

    switch (header) {
        case 'Reviews for Trusted Partner and Standard Employment Permit Applications': return 'reviews';
        case 'Requests for Support Letters for a Stamp 4': return 'stamp4';
    }

    return null;
};

export const fromTicks = (ticks: number, format: string) => {
    if (format === 'raw') {
        return ticks;
    } else {
        const date = new Date(ticks);
        return `${date.getUTCFullYear()}-${twoDigits(date.getUTCMonth() + 1)}-${twoDigits(date.getUTCDate())}`;
    }
};

export const toTicks = (date: string | null) => {
    if (date && date.length !== 10) {
        throw new Error(`'${date}' is not in a valid date format.`);
    }

    const ticks = new Date(`${date}T00:00:00.000Z`).getTime();
    if (isNaN(ticks)) {
        throw new Error(`'${date}' is not a valid date.`);
    }
    return ticks;
};

const dayInTicks = 24 * 60 * 60 * 1000;

export const applyInterval = (ticks: number, interval: any) => {
    if (typeof interval === 'number') {
        return ticks + (interval * dayInTicks);
    }
    return ticks;
};

function number(num: any) {
    if (!isNaN(num)) {
        return parseInt(num, 10);
    }
    return undefined;
}

export const range = (ticks: number, interval: any): number[] => {
    const values = [ ticks ];
    const intervalAsNumber = number(interval);
    if (typeof intervalAsNumber === 'number') {
        const direction = intervalAsNumber > 0;
        const abs = Math.min(Math.abs(intervalAsNumber), 30);
        for (let i = abs; i > 0; i--) {
            values.push(ticks + (i * dayInTicks * (direction ? 1 : -1)));
        }
    }
    return values.sort();
};
