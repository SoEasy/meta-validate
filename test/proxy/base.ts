import 'reflect-metadata';
import { expect } from 'chai';
import { ProxyValidator } from './../../src/proxy';

class A {
    @ProxyValidator.Validation.nested().make()
    foo: number = 2;
}

describe('Base bus interaction', () => {
    describe('Decorator', () => {
        it('must make setter', () => {
            const a = new A();
            a.foo = 3;
            expect(a.hasOwnProperty('foo')).to.be.false;
            expect(a.foo).to.eql(3);
        });
    });
});
