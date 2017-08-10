// import { Validity } from '../index';
import 'reflect-metadata';
// import { Subject } from 'rxjs';
// import { Validate, ValidationTrigger } from './../index';

// type IChainedDecorator {
//     (propertyKey: string, target: any): TypedPropertyDescriptor<any>;
// }

class ValidationClass {
    protected prebuiltValidators: Record<string, (...args: Array<any>) => boolean> = {};

    protected required(): void {
        console.log('required');
    }

    make(): any {
        return (target: any, propertyKey: string): TypedPropertyDescriptor<any> => {
            console.log('some logic', this);
            const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
                configurable: true,
                enumerable: true
            };

            (Reflect as any).defineMetadata('mv', this.prebuiltValidators, target);

            let value: any;
            const originalGet = descriptor.get || ((): any => value);
            const originalSet = descriptor.set || ((val): void => (value = val));
            descriptor.get = originalGet;
            descriptor.set = function(newVal: any): void {
                // tslint:disable-next-line
                const currentVal = originalGet.call(this);
                originalSet.call(this, newVal);
                const prebuiltValidators = (Reflect as any).getMetadata('mv', target);
                if (newVal !== currentVal) {
                    console.log('Im inside setter!', this, prebuiltValidators);
                }
            };

            Object.defineProperty(target, propertyKey, descriptor);
            return descriptor;
        };
    }
}

function ValidateNumber(): MVNumber {
    return new MVNumber();
}

class MVNumber extends ValidationClass {
    required(): MVNumber {
        super.required();
        return this;
    }

    lt(arg: number): MVNumber {
        this.prebuiltValidators['min'] = (v: number): boolean => !v || v < arg;
        return this;
    }

    lte(arg: number): MVNumber {
        this.prebuiltValidators['min'] = (v: number): boolean => !v || v <= arg;
        return this;
    }

    gt(arg: number): MVNumber {
        this.prebuiltValidators['max'] = (v: number): boolean => !v || v > arg;
        return this;
    }

    gte(arg: number): MVNumber {
        this.prebuiltValidators['max'] = (v: number): boolean => !v || v > arg;
        return this;
    }

    integer(): MVNumber {
        this.prebuiltValidators['integer'] = (v: number): boolean => !v || !Number.isSafeInteger(v);
        return this;
    }

    negative(): MVNumber {
        this.prebuiltValidators['negative'] = (v: number): boolean => !v || v >= 0;
        return this;
    }

    positive(): MVNumber {
        this.prebuiltValidators['positive'] = (v: number): boolean => !v || v <= 0
        return this;
    }

    divideBy(arg: number): MVNumber {
        this.prebuiltValidators['divideBy'] = (v: number): boolean => !v || v % arg !== 0;
        return this;
    }
}

class TestClass {
    @ValidateNumber().required().gte(2).lte(5).integer().make()
    fieldOne: number = 0;
}

const t = new TestClass();
t.fieldOne = 1;

// class NestedClass {
//     validity: Subject<any> = new Subject();
//
//     @Validate<number>({
//         odd: (value): boolean => value % 2 === 0
//     })
//     nestedFoo: number = 3;
// }
//
// class TestClass {
//     validity: Subject<any> = new Subject();
//
//     @Validate<string>({
//         length: (value, instance): boolean => instance.secondValue === 'a' ? true : value.length !== 3
//     }, ['secondValue'])
//     firstValue: string = '';
//
//     @ValidationTrigger()
//     secondValue: string = '';
//
//     // @ValidateNested()
//     // nestedValue: NestedClass = new NestedClass();
// }
//
// const t = new TestClass();
// t.validity.subscribe(v => console.log(JSON.stringify(v)));
// t.firstValue = 'bar';
// t.secondValue = 'a';
// t.secondValue = 'b';
// console.log('Oppa!');
