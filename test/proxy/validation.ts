import { expect } from 'chai';
import { MetaValidateProxy, ProxyField } from './../../src/proxy';
import 'reflect-metadata';

class Data {
    foo: string = 'goodbye';
    bar: string = 'no';
}

class DataProxy extends MetaValidateProxy<Data> {
    @ProxyField.Validation
    .validator('to2', (value: string) => value.length !== 2).make()
    foo: string;

    @ProxyField.Validation
    .validator('to2', (value: string) => value.length !== 2).make()
    bar: string;
}

describe('Base validations:', () => {
    it('must run simple validator', () => {
        const data = new Data();
        const proxy = new DataProxy();
        proxy.attachDataSource(data);
        expect(proxy.validateField('foo')).to.eql({foo: {to2: true}});
        proxy.foo = 'no';
        expect(proxy.validateField('foo')).to.eql({foo: {to2: false}});
    });

    it('must return full validation', () => {
        const data = new Data();
        const proxy = new DataProxy();
        proxy.attachDataSource(data);
        expect(proxy.validate()).to.eql({foo: {to2: true}, bar: {to2: false}});
    });
});
