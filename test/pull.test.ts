import { pull } from '../src/pull';
import { expect } from 'chai';

const fail = (err: Error) => {
    throw err;
};

describe('Pull', () => {

    it(`should pull data from live page`, async function() {
        this.timeout(30000);
        const result = await pull(fail);
        expect(result.ticks).to.be.greaterThan(0);
        expect(result.updated).to.be.greaterThan(0);
        expect(result.processes.reviews).to.be.greaterThan(0);
        expect(result.processes.stamp4).to.be.greaterThan(0);
        expect(result.processes.standard).to.be.greaterThan(0);
        expect(result.processes.trusted).to.be.greaterThan(0);
    });

});
