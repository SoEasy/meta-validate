import { expect } from 'chai';
import { MetaValidateProxy } from './../../src/proxy/base-class';

class Data {
    foo: string;
}

function propDecorator(target: any, propertyKey: string): any {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
        configurable: true,
        enumerable: true
    };

    const valueStore = new WeakMap<any, any>();

    const originalGet = descriptor.get || function(): any {
        return valueStore.get(this as any);
    };
    const originalSet = descriptor.set || function(val: any): void {
        valueStore.set(this, val);
    };

    descriptor.get = originalGet;
    descriptor.set = function(newVal: any): void {
        const currentVal = originalGet.call(this);
        originalSet.call(this, newVal);

        if (newVal !== currentVal) {
            console.log('change val', this);
            this.passDataToDest(propertyKey, newVal);
        }
    };
    Object.defineProperty(target, propertyKey, descriptor);
    return descriptor;
}

class DataProxy extends MetaValidateProxy<Data> {
    @propDecorator
    foo: string;
}

describe('Base proxy and data-source interaction', () => {
    it('must load data from proxy', () => {
        /**/
    });

    it('must pass data from proxy to dest', () => {
        const data = new Data();
        const m = new DataProxy();
        m.attachDataSource(data);
        m.foo = 'hello';
        expect(data.foo).to.eql('hello');
    });
});
