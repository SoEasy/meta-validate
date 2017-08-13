import { MetaValidate, ReceiveValidity, Validity } from '../index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

class TestClass implements ReceiveValidity {
    validity: BehaviorSubject<Validity> = new BehaviorSubject<Validity>({});

    @MetaValidate.Number<TestClass>()
        .skip(() => false)
        .min(5)
        .if(() => false)
        .make()
    fieldOne: number = null;

    @MetaValidate.String<TestClass>().make()
    fieldString: string = 'hello';
}

const t1 = new TestClass();
t1.validity.subscribe((v) => console.log('validity', v.errors.fieldOne.min));

t1.fieldOne = 6;
t1.fieldOne = 4;
