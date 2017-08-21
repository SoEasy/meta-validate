import { MetaValidate, ReceiveValidity, Validity } from '../index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

class NestedClass implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>({});

    @MetaValidate.String<NestedClass>().required().make()
    nField: string = null;
}

class TestClass implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>({});

    @MetaValidate.Number<TestClass>()
        .custom('foo', () => false)
        .make()
    fieldOne: number = null;
    //
    // @MetaValidate.String<TestClass>().make()
    // fieldString: string = 'hello';

    @MetaValidate.Nested().with(['fieldOne']).make()
    nestedField: NestedClass = new NestedClass();
}

const t1 = new TestClass();
t1.validity$.subscribe((v) => console.log('validity', JSON.stringify(v.errors)));

t1.fieldOne = 7;
//
// t1.nestedField.nField = 'bar';
// t1.nestedField.nField = null;
//
// t1.nestedField = new NestedClass();
// t1.nestedField.nField = 'hello!';
