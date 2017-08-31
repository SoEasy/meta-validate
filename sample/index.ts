import { MetaValidate, ReceiveValidity, Validity } from '../index';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'reflect-metadata';

class TestClass implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>({});

    @MetaValidate.String<TestClass>()
    .skip(instance => {
        const retVal = !instance.fooField || instance.fooField.search(/\D/g) > -1;
        console.log('check skip', retVal);
        return retVal;
    })
    .custom('length', () => { console.log('custom validate'); return true; })
    .make()
    fooField: string = '666666';
}

const t1 = new TestClass();
t1.validity$.subscribe((v) => console.log('validity t1', JSON.stringify(v), v.isFullValid()));

t1.fooField = '1';
t1.fooField = '12';
t1.fooField = '23d';

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
