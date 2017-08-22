import { MetaValidate, ReceiveValidity, Validity } from '../index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'reflect-metadata';

class NestedClass implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>({});

    @MetaValidate.String<NestedClass>().required().make()
    nField: string = null;
}

class TestClass implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>({});

    @MetaValidate.Trigger().make()
    toSkip: boolean = true;

    @MetaValidate.Nested().skip((i) => i.toSkip).with(['toSkip']).make()
    nestedField: NestedClass = new NestedClass();
}

const t1 = new TestClass();
t1.validity$.subscribe((v) => console.log('validity', JSON.stringify(v.errors), v.isFullValid()));

t1.nestedField.nField = '2';
t1.nestedField.nField = null;
t1.toSkip = false;
// t1.nestedField.nField = '3';
//
// t1.nestedField.nField = 'bar';
// t1.nestedField.nField = null;
//
// t1.nestedField = new NestedClass();
// t1.nestedField.nField = 'hello!';
