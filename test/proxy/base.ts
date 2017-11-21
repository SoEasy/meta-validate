import 'reflect-metadata';
import { expect } from 'chai';
import { ProxyValidator } from './../../src/proxy';
import { ValidationProxy } from './../../src/proxy/validation-proxy';

class A extends ValidationProxy<any> {
    constructor() {
        super();
    }

    // dest: any = {};

    @ProxyValidator.Validation.nested().make()
    foo: number = 2;
}

describe('Base bus interaction', () => {
    describe('Decorator', () => {
        it('must make setter', () => {
            const a = new A();
            a.foo = 3;
            // expect(a.hasOwnProperty('foo')).to.be.false;
            expect(a.foo).to.eql(3);
            // expect(a.dest.foo).to.eql(3);
        });
    });
});
