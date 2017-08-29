import { pull } from '../src/pull';
import { toTicks } from '../src/utils';
import { expect } from 'chai';

const fail = (err: Error) => {
    throw err;
};

describe('Pull', () => {

    it(`should pull data from live page`, async function() {
        this.timeout(30000);
        const result = await pull();

        const min = toTicks('2017-07-01');
        
        expect(result.ticks).to.be.greaterThan(min);
        expect(result.updated).to.be.greaterThan(min);
        expect(result.processes.reviews).to.be.greaterThan(min);
        expect(result.processes.stamp4).to.be.greaterThan(min);
        expect(result.processes.standard).to.be.greaterThan(min);
        expect(result.processes.trusted).to.be.greaterThan(min);
    });

});
