import { expect } from 'chai';

import {
    sanitize,
    extractWhenUpdated,
    parseDate,
    fromTicks,
    toTicks,
    formatPermit,
    applyInterval,
    range
} from '../src/utils';

const currentYear = new Date().getUTCFullYear();

describe('Utility Functions', () => {

    [
        [ ' Hello ', 'Hello' ],
        [ ' Hello World', 'Hello World' ],
        [ null, '' ],
        [ ' ', '' ]
    ].forEach((item) => {
        it(`should sanitize '${item[0]}' to '${item[1]}'`, () => {
            expect(sanitize(item[0])).to.be.eq(item[1]);
        });
    });

    [
            [ 'As of the 9 April we are', '9 April' ],
            [ 'As of the 12 Apr we are', '12 Apr' ],
            [ 'As of the 24 December we', '24 December' ],
            [ 'As of the 1 Jan we', '1 Jan' ],
            [ 'As of the', '' ],
            [ '', '' ],
    ].forEach((item) => {
        it(`should extract '${item[1]}' from '${item[0]}'`, () => {
            expect(extractWhenUpdated(item[0])).to.be.eq(item[1]);
        });
    });

    [
            [ '9 Apri 2017', 'Sun, 09 Apr 2017 00:00:00 GMT' ],
            [ '9 April 2017', 'Sun, 09 Apr 2017 00:00:00 GMT' ],
            [ '25 Decem 2012', 'Tue, 25 Dec 2012 00:00:00 GMT' ],
            [ '25 December 2012', 'Tue, 25 Dec 2012 00:00:00 GMT' ],
            [ '12 Mar', 'Sun, 12 Mar 2017 00:00:00 GMT' ],
            [ '12 March', 'Sun, 12 Mar 2017 00:00:00 GMT' ],
            [ '29 Oct', 'Sat, 29 Oct 2016 00:00:00 GMT' ],
            [ '29 October', 'Sat, 29 Oct 2016 00:00:00 GMT' ],
            [ '10 Apri', 'Mon, 10 Apr 2017 00:00:00 GMT' ],
            [ '10 April', 'Mon, 10 Apr 2017 00:00:00 GMT' ]
    ].forEach((item) => {
        it(`should parse '${item[0]}' into date '${item[1]}'`, () => {
            const relativeDate = new Date('2017-04-10T00:00:00.000Z');
            expect(parseDate(item[0], relativeDate).toUTCString()).to.be.eq(item[1]);
        });
    });

    [
            [ 'Trusted Partner', 'trusted' ],
            [ 'Standard', 'standard' ],
            [ 'Reviews received', 'reviews' ],
            [ 'Requests received week beginning', 'stamp4' ],
    ].forEach((item) => {
        it(`should format permit name '${item[0]}' to '${item[1]}'`, () => {
            expect(formatPermit(item[0])).to.be.eq(item[1]);
        });
    });

    [
            { ticks: 1494460800000, date: '2017-05-11', raw: 1494460800000 },
            { ticks: 1494374400000, date: '2017-05-10', raw: 1494374400000 },
    ].forEach((item) => {
        it(`should parse date '${item.ticks}' to/from '${item.date}'`, () => {
            expect(fromTicks(item.ticks, 'date')).to.be.eq(item.date);
            expect(fromTicks(item.ticks, 'raw')).to.be.eq(item.raw);
            expect(fromTicks(item.ticks, 'anything')).to.be.eq(item.date);

            expect(toTicks(item.date)).to.be.eq(item.ticks);
        });
    });

    [
            { date: '2017-05' },
            { date: '2017' },
            { date: '2017-05-10-as' },
            { date: 'asdf' },
            { date: null },
    ].forEach((item) => {
        it(`should thow error when parsing date '${item.date}'`, () => {
            expect(() => toTicks(item.date)).to.throw();
        });
    });

    [
            { date: '2017-05-06', interval: 'asdf', expected: '2017-05-06' },
            { date: '2017-05-06', interval: null, expected: '2017-05-06' },
            { date: '2017-05-06', interval: 0, expected: '2017-05-06' },
            { date: '2017-05-06', interval: 5, expected: '2017-05-11' },
            { date: '2017-05-10', interval: -5, expected: '2017-05-05' },
            { date: '2017-05-20', interval: -20, expected: '2017-04-30' },
    ].forEach((item) => {
        it(`should apply interval '${item.interval}' to date '${item.date}' and get '${item.expected}'`, () => {
            expect(fromTicks(applyInterval(toTicks(item.date), item.interval), 'date')).to.be.eq(item.expected);
        });
    });

    [
            { date: '2017-05-11', interval: 'asdf', expected: [ toTicks('2017-05-11') ] },
            { date: '2017-05-11', interval: null, expected: [ toTicks('2017-05-11') ] },
            { date: '2017-05-11', interval: 0, expected: [ toTicks('2017-05-11') ] },
            { date: '2017-05-11', interval: 1, expected: [ toTicks('2017-05-11'), toTicks('2017-05-12') ] },
            { date: '2017-05-11', interval: '2', expected: [ toTicks('2017-05-11'), toTicks('2017-05-12'), toTicks('2017-05-13') ] },
            { date: '2017-05-11', interval: -1, expected: [ toTicks('2017-05-10'), toTicks('2017-05-11') ] },
            { date: '2017-05-11', interval: '-2', expected: [ toTicks('2017-05-09'), toTicks('2017-05-10'), toTicks('2017-05-11') ] },
    ].forEach((item) => {
        it(`should return range of '${item.interval}' for date '${item.date}'`, () => {
            expect(range(toTicks(item.date), item.interval)).to.deep.eq(item.expected);
        });
    });

});
