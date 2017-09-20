import { MVBase } from './base';
import { IBaseDecoratorType } from '../interfaces';

export type MVNumberArg<T> = number | ((instance: T) => number);

export class MVNumber<T> extends MVBase implements IBaseDecoratorType {
    required(): MVNumber<T> {
        super.required();
        return this;
    }

    skipIf(condition: (i: any) => boolean): MVNumber<T> {
        super.skipIf(condition);
        return this;
    }

    skip(condition: (i: T) => boolean): MVNumber<T> {
        super.skip(condition);
        return this;
    }

    with(fields: Array<string> | string, ...anotherFields: Array<string>): MVNumber<T> {
        super.with(fields, ...anotherFields);
        return this;
    }

    custom(name: string, validator: (value: number, instance: any) => boolean): MVNumber<T> {
        super.custom(name, validator);
        return this;
    }

    min(arg: MVNumberArg<T>): MVNumber<T> {
        const validator = (v: any, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) < compareValue;
        };
        this.attachValidator('min', validator);
        return this;
    }

    greater(arg: MVNumberArg<T>): MVNumber<T> {
        const validator = (v: any, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) <= compareValue;
        };
        this.attachValidator('greater', validator);
        return this;
    }

    max(arg: MVNumberArg<T>): MVNumber<T> {
        const validator = (v: any, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) > compareValue;
        };
        this.attachValidator('max', validator);
        return this;
    }

    less(arg: MVNumberArg<T>): MVNumber<T> {
        const validator = (v: any, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) >= compareValue;
        };
        this.attachValidator('less', validator);
        return this;
    }

    integer(): MVNumber<T> {
        const validator = (v): boolean => {
            const isSafe = typeof v === 'number'
                && v === v
                && v !== Number.POSITIVE_INFINITY
                && v !== Number.NEGATIVE_INFINITY
                && parseInt(v + '', 10) === v
                && Math.abs(v) < Number.MAX_VALUE;
            return !v || !isSafe;
        };
        this.attachValidator('integer', validator);
        return this;
    }

    negative(): MVNumber<T> {
        const validator = (v: any): boolean => !v || parseFloat(v) >= 0;
        this.attachValidator('negative', validator);
        return this;
    }

    positive(): MVNumber<T> {
        const validator = (v: any): boolean => !v || parseFloat(v) <= 0;
        this.attachValidator('positive', validator);
        return this;
    }

    divideBy(arg: MVNumberArg<T>): MVNumber<T> {
        const validator = (v: any, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || parseFloat(v) % compareValue !== 0;
        };
        this.attachValidator('divideBy', validator);
        return this;
    }
}
