import 'reflect-metadata';
import { expect } from 'chai';
import { ProxyValidator } from './../../src/proxy';
import { ValidationProxy } from './../../src/proxy/validation-proxy';

class Brain {
    iq: number;
}

class Hands {
    canWork: boolean;
}

class Person {
    name: string;

    brain: Brain = new Brain();

    hands: Hands = new Hands();
}

class Customer {
    foo: number;

    person: Person = new Person();
}

class ProxyBrain extends ValidationProxy<any> {
    @ProxyValidator.Validation
    .with('$parent.$parent.foo')
    .validator('isIdiot', (_, instance) => instance.$parent.$parent.foo === 1)
    .make()
    iq: number;
}

class ProxyHands extends ValidationProxy<any> {
    @ProxyValidator.Validation
    .with('$parent.brain.iq')
    .validator('canSimpleWork', (_, instance) => instance.$parent.brain.iq < 40)
    .make()
    canWork: boolean;
}

class ProxyPerson extends ValidationProxy<any> {
    @ProxyValidator.Validation
    .with('$parent.foo')
    .validator('invalid', (_, instance) => instance.$parent.foo !== 1)
    .make()
    name: string;

    @ProxyValidator.Nested
    brain: ProxyBrain = new ProxyBrain();

    @ProxyValidator.Nested
    hands: ProxyHands = new ProxyHands();
}

class ProxyCustomer extends ValidationProxy<any> {
    @ProxyValidator.Validation
    .skip(() => true)
    .with('person.brain.iq')
    .validator('tooMuchBrain', (_, instance) => instance.person.brain.iq < 80)
    .make()
    foo: number;

    @ProxyValidator.Nested
    person: ProxyPerson = new ProxyPerson();
}

describe('Base bus interaction', () => {
    it('must correctly validate nested and parent releated fields', () => {
        const proxy = new ProxyCustomer();
        proxy.attachDataSource(new Customer());
        proxy.foo = 2;
        // proxy.foo = 1;
        proxy.person.brain.iq = 2;
        proxy.person.brain.iq = 92;
        proxy.person.brain.iq = 30;
        expect(proxy.validate()).to.eql({
            foo: { tooMuchBrain: false },
            person: {
                name: { invalid: false },
                brain: {
                    iq: { isIdiot: true }
                },
                hands: {
                    canWork: { canSimpleWork: true }
                }
            }
        });
    });

    it('must subscribe to validity and emit', () => {
        const proxy = new ProxyCustomer();
        proxy.attachDataSource(new Customer());
        proxy.validateAndAssign();
        let counter = 0;
        proxy.subscribeToValidity(validity => {
            console.log(JSON.stringify(validity));
            counter += 1;
        });
        proxy.foo = 1;
        proxy.foo = 2;
        proxy.person.hands.canWork = true;
        expect(counter).to.eql(3);
    });
});
