import { MetaValidate, ReceiveValidity, Validity, MVBase } from '../index';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'reflect-metadata';

@MetaValidate.Register
class CustomValidators extends MVBase {
    private fooValidator(value?: any, instance?: any): boolean {
        console.log('foo validate', value, instance);
        return false;
    }

    foo(): CustomValidators {
        this.attachValidator('foo', this.fooValidator);
        return this;
    }
}

// class NestedClass implements ReceiveValidity {
//     validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>(null);
//
//     @MetaValidate.String('baz').required().make()
//     bar: string = '';
// }

class TestClass implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject<Validity>(null);

    // @MetaValidate.String<TestClass>('phone')
    // .required()
    // .length(4)
    // .make()
    // _phone: string = '';
    //
    // get phone(): string {
    //     return this._phone;
    // }
    //
    // set phone(value: string) {
    //     this._phone = value;
    // }

    @MetaValidate.Get<CustomValidators>(CustomValidators).foo().skipIf(() => true).make()
    n: string = '123312';
}

const t1 = new TestClass();
t1.validity$.subscribe((v) => {
    console.log('validity t1', JSON.stringify(v), v && v.isFullValid());
});

t1.n = null;
t1.n = 'hello';

// t1.phone = '1';
// t1.phone = null;
// t1.phone = '12';
// t1.phone = '23d';

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
