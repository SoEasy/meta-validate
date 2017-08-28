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

    @MetaValidate.String<TestClass>()
    .with(['relatedField'])
    .required()
    .minLength(3)
    .maxLength(6)
    .make()
    fooField: string = '666666';

    @MetaValidate.Trigger().make()
    relatedField: number = 2;

    hash: number = 42;

    @MetaValidate.Nested()
    .with(['relatedField'])
    .required()
    .make()
    nestedField: NestedClass = new NestedClass();
}

const t1 = new TestClass();
const t2 = new TestClass();
t1.validity$.subscribe((v) => console.log('validity t1', JSON.stringify(v), v.isFullValid()));
t2.validity$.subscribe((v) => console.log('validity t2', JSON.stringify(v), v.isFullValid()));

t1.nestedField = null;
t2.nestedField = null;

t1.nestedField = new NestedClass();
t1.relatedField = 41;

t2.relatedField = 44;

// t1.relatedField = 4;
// t1.relatedField = 6;
// t1.nestedField.nField = '2';
// t1.relatedField = 7;
// t1.nestedField.nField = null;


// t1.nestedField.nField = '2';
// t1.nestedField.nField = null;
// t1.toSkip = false;
// t1.nestedField.nField = '3';
//
// t1.nestedField.nField = 'bar';
// t1.nestedField.nField = null;
//
// t1.nestedField = new NestedClass();
// t1.nestedField.nField = 'hello!';
