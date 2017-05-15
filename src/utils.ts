import { PullResult } from './interfaces';

export const sanitize = (input: string | null) => {
    return input ? input.trim().replace(/\s+/g, ' ') : '';
};

export const extractWhenUpdated = (input: string) => {
    const regex = /As of the(.*) we/gm;
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
    const parts = sanitize(input).split(' ');
    let year = '';
    const month = months[parts[1].substring(0, 3)];
    const day = parseInt(parts[0], 10);

    if (parts.length === 3) {
        year = parts[2];
    } else if (parts.length === 2) {
        if (month > relativeDate.getMonth() + 1) {
            year = (relativeDate.getFullYear() - 1).toString();
        } else {
            year = relativeDate.getFullYear().toString();
        }
    }

    return new Date(`${year}-${twoDigits(month)}-${twoDigits(day)}T00:00:00.000Z`);
};

export const formatResults = (results: PullResult[], format: string) => {
    return results.map((r) => formatResult(r, format));
};

export const formatResult = (result: PullResult, format: string) => {
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

export const formatPermit = (input: string) => {
    const sanitized = sanitize(input);
    switch (sanitized) {
        case 'Trusted Partner': return 'trusted';
        case 'Standard': return 'standard';
        case 'Reviews received': return 'reviews';
        case 'Requests received week beginning': return 'stamp4';
    }
    return sanitized;
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

export const range = (ticks: number, interval: any): number[] => {
    const values = [ ticks ];
    if (typeof interval === 'number' && interval) {
        const direction = interval > 0;
        const abs = Math.abs(interval);
        if (abs <= 30) {
            for (let i = abs; i > 0; i--) {
                values.push(ticks + (i * dayInTicks * (direction ? 1 : -1)));
            }
        }
    }
    return values.sort();
};
