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
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12
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
    const month = months[parts[1]];
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

export const formatPermit = (input: string) => {
    const sanitized = sanitize(input);
    switch (sanitized) {
        case 'Trusted Partner': return 'trusted';
        case 'Standard': return 'standard';
        case 'Reviews received': return 'reviews';
        case 'Requests received week beginning': return 'stamp4';
    }
    return null;
};
