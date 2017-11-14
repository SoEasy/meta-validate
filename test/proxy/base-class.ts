import { expect } from 'chai';
import { MetaValidateProxy, ProxyField } from './../../src/proxy';
import 'reflect-metadata';

class Data {
    foo: string = 'goodbye';
    bar: string = 'goodbye';

    address: Address = new Address();
}

class Address {
    city: string = 'Moscow';
}

class AddressProxy extends MetaValidateProxy<Address> {
    @ProxyField.Validation.make()
    city: string;
}

class DataProxy extends MetaValidateProxy<Data> {
    @ProxyField.Validation.make()
    foo: string;

    @ProxyField.Trigger
    bar: string;

    @ProxyField.Nested
    address: AddressProxy = new AddressProxy();
}

describe('Base proxy and data-source interaction', () => {
    describe('Simple decorators interaction', () => {
        it('must load data from proxy validation field', () => {
            const data = new Data();
            const proxy = new DataProxy();
            proxy.attachDataSource(data);
            expect(proxy.foo).to.eql('goodbye');
            expect(proxy.foo).to.eql(data.foo);
        });

        it('must load data from proxy trigger field', () => {
            const data = new Data();
            const proxy = new DataProxy();
            proxy.attachDataSource(data);
            expect(proxy.bar).to.eql('goodbye');
            expect(proxy.bar).to.eql(data.bar);
        });

        it('must pass data from proxy to dest', () => {
            const data = new Data();
            const proxy = new DataProxy();
            proxy.attachDataSource(data);
            proxy.foo = 'hello';
            expect(data.foo).to.eql('hello');
            expect(data.foo).to.eql(proxy.foo);
        });

        it('must pass data from proxy trigger to dest', () => {
            const data = new Data();
            const proxy = new DataProxy();
            proxy.attachDataSource(data);
            proxy.bar = 'hello';
            expect(data.bar).to.eql('hello');
            expect(data.bar).to.eql(proxy.bar);
        });
    });

    describe('Nested decorator interaction', () => {
        it('must correctly load initial data to nested proxy', () => {
            const data = new Data();
            const proxy = new DataProxy();
            proxy.attachDataSource(data);
            expect(proxy.address.city).to.eql('Moscow');
            expect(proxy.address.city).to.eql(data.address.city);
        });

        it('must correctly pass data from proxy to nested field', () => {
            const data = new Data();
            const proxy = new DataProxy();
            proxy.attachDataSource(data);
            proxy.address.city = 'Ekb';
            expect(data.address.city).to.eql('Ekb');
            expect(data.address.city).to.eql(proxy.address.city);
        });
    });
});
