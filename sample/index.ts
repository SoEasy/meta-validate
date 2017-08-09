// import { Validity } from '../index';
import 'reflect-metadata';
import { Subject } from 'rxjs';
import { Validate, ValidateNested } from './../index';

class NestedClass {
    validity: Subject<any> = new Subject();

    @Validate<number>({
        odd: (value): boolean => value % 2 === 0
    })
    nestedFoo: number = 3;
}

class TestClass {
    validity: Subject<any> = new Subject();

    @Validate<string>({
        length: (value): boolean => value.length !== 3
    })
    firstValue: string = '';

    @ValidateNested()
    nestedValue: NestedClass = new NestedClass();
}

const t = new TestClass();
t.validity.subscribe(v => console.log(JSON.stringify(v), v.isFullValid(['nestedValue'])));

t.firstValue = 'bar';
t.nestedValue.nestedFoo = 4;
console.log('Oppa!');
