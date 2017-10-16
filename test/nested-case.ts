import { MetaValidate, Validity } from './../src/index';
import { BehaviorSubject } from 'rxjs';
import 'reflect-metadata';

class Inner {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject(new Validity());
    @MetaValidate.Number().required().make()
    foo: number = null;
}

class Base {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject(new Validity());

    @MetaValidate.Nested().skip(i => i.trigger).with('trigger').make()
    innerData: Inner = new Inner();

    @MetaValidate.Trigger().make()
    trigger: boolean = false;
}

const c = new Base();
let counter = 0;
c.validity$.subscribe(
    v => {
        console.log(counter, JSON.stringify(v.errors));
        counter++;
    }
);
c.trigger = true;
c.trigger = false;

describe('Base validation', () => {
    it('must validate custom', () => {
        c.trigger = true;
        c.trigger = false;
    });
});