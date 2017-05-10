import { expect } from 'chai';

import { sanitize, extractWhenUpdated, parseDate, formatPermit } from '../src/utils';

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
            [ 'As of the 24 December we', '24 December' ],
            [ 'As of the', '' ],
            [ '', '' ],
    ].forEach((item) => {
        it(`should extract '${item[1]}' from '${item[0]}'`, () => {
            expect(extractWhenUpdated(item[0])).to.be.eq(item[1]);
        });
    });

    [
            [ '9 April 2017', 'Sun, 09 Apr 2017 00:00:00 GMT' ],
            [ '25 December 2012', 'Tue, 25 Dec 2012 00:00:00 GMT' ],
            [ '12 March', 'Sun, 12 Mar 2017 00:00:00 GMT' ],
            [ '29 October', 'Sat, 29 Oct 2016 00:00:00 GMT' ],
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

});
