import 'reflect-metadata';
import { expect } from 'chai';
import { ProxyValidator } from './../../src/proxy';
import { ValidationProxy } from './../../src/proxy/validation-proxy';
import { ProxyRepository } from './../../src/proxy/proxy.repository';

class PassTest {
    foo: number = 1;
}

class ProxyPassTest extends ValidationProxy<any> {
    @ProxyValidator.Validation.make()
    foo: number;
}

class ValidatorsTest {
    value: string = 'hello';
}

class ProxyValidatorsTest extends ValidationProxy<any> {
    @ProxyValidator.Validation
    .validator('startsWith1', value => value.indexOf('1') !== 0)
    .validator('startsWith2', value => value.indexOf('2') !== 0)
    .validator('startsWith3', value => value.indexOf('3') !== 0)
    .make()
    value: string;
}

class ProxyWithTest extends ValidationProxy<any> {
    @ProxyValidator.Validation
    .validator('validity', (_, instance) => instance.mustValidate)
    .with('mustValidate')
    .make()
    value: string;

    @ProxyValidator.Trigger
    mustValidate: boolean;
}

describe('Base bus interaction', () => {
    describe('Decorator', () => {
        it('must receive value from dest', () => {
            const dest = new PassTest();
            const proxy = new ProxyPassTest();
            proxy.attachDataSource(dest);
            expect(proxy.foo).to.eql(1);
        });

        it('must make setter', () => {
            const dest = new PassTest();
            const proxy = new ProxyPassTest();
            proxy.attachDataSource(dest);
            proxy.foo = 3;
            expect(proxy.hasOwnProperty('foo')).to.be.false;
            expect(proxy.foo).to.eql(3);
        });

        it('must pass value to dest', () => {
            const dest = new PassTest();
            const proxy = new ProxyPassTest();
            proxy.attachDataSource(dest);
            proxy.foo = 3;
            expect(dest.foo).to.eql(3);
        });
    });

    describe('Validator', () => {
        it('must correctly run validators on field', () => {
            const dest = new ValidatorsTest();
            const proxy = new ProxyValidatorsTest();
            proxy.attachDataSource(dest);
            expect(proxy.validateField('value'))
                .to.eql({startsWith1: true, startsWith2: true, startsWith3: true});
            proxy.value = '1fd';

            expect(proxy.validateField('value'))
                .to.eql({startsWith1: false, startsWith2: true, startsWith3: true});

            proxy.value = '2fd';
            expect(proxy.validateField('value'))
                .to.eql({startsWith1: true, startsWith2: false, startsWith3: true});

            proxy.value = '3fd';
            expect(proxy.validateField('value'))
                .to.eql({startsWith1: true, startsWith2: true, startsWith3: false});
        });

        it('must correctly validate object', () => {
            const dest = new ValidatorsTest();
            const proxy = new ProxyValidatorsTest();
            proxy.attachDataSource(dest);
            expect(proxy.validate())
                .to.eql({value: {startsWith1: true, startsWith2: true, startsWith3: true}});
        });
    });

    describe('ProxyRepository', () => {
        it('must correctly save metadata for different instances', () => {
            const proxy1 = new ProxyValidatorsTest();
            const proxy2 = new ProxyPassTest();
            const proxy3 = new ProxyWithTest();
            const proxy1Metadata = ProxyRepository.getProxyConfigByInstance(proxy1);
            const proxy2Metadata = ProxyRepository.getProxyConfigByInstance(proxy2);
            const proxy3Metadata = ProxyRepository.getProxyConfigByInstance(proxy3);
            expect(
                proxy1Metadata
            ).to.be.not.eql(
                proxy2Metadata
            );
            expect(
                proxy1Metadata
            ).to.be.not.eql(
                proxy3Metadata
            );
        });
    });
});
