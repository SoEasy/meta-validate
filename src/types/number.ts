import { MVBase } from './base';
import { IBaseDecoratorType } from '../interfaces';

export type MVNumberArg<T> = number | ((instance: T) => number);

export class MVNumber<T> extends MVBase implements IBaseDecoratorType {
    required(): MVNumber<T> {
        super.required();
        return this;
    }

    if(condition: (i: any) => boolean): MVNumber<T> {
        super.if(condition);
        return this;
    }

    skip(condition: (i: T) => boolean): MVNumber<T> {
        super.skip(condition);
        return this;
    }

    with(fields: Array<string>): MVNumber<T> {
        super.with(fields);
        return this;
    }

    custom(name: string, validator: (value: number, instance: any) => boolean): MVNumber<T> {
        super.custom(name, validator);
        return this;
    }

    convert(): MVNumber<T> {
        this.converters.push((value: any) => {
            try {
                return parseFloat(value);
            } catch (e) {
                return undefined;
            }
        });
        return this;
    }

    min(arg: MVNumberArg<T>): MVNumber<T> {
        this.lastValidator = 'min';
        this.prebuiltValidators['min'] = (v: number, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v < compareValue;
        };
        return this;
    }

    greater(arg: MVNumberArg<T>): MVNumber<T> {
        this.lastValidator = 'greater';
        this.prebuiltValidators['greater'] = (v: number, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v <= compareValue;
        };
        return this;
    }

    max(arg: MVNumberArg<T>): MVNumber<T> {
        this.lastValidator = 'max';
        this.prebuiltValidators['max'] = (v: number, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v > compareValue;
        };
        return this;
    }

    less(arg: MVNumberArg<T>): MVNumber<T> {
        this.lastValidator = 'less';
        this.prebuiltValidators['less'] = (v: number, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v >= compareValue;
        };
        return this;
    }

    integer(): MVNumber<T> {
        this.lastValidator = 'integer';
        this.prebuiltValidators['integer'] = (v): boolean => {
            const isSafe = typeof v === 'number'
                && v === v
                && v !== Number.POSITIVE_INFINITY
                && v !== Number.NEGATIVE_INFINITY
                && parseInt(v + '', 10) === v
                && Math.abs(v) < Number.MAX_VALUE;
            return !v || !isSafe;
        };
        return this;
    }

    negative(): MVNumber<T> {
        this.lastValidator = 'negative';
        this.prebuiltValidators['negative'] = (v: number): boolean => !v || v >= 0;
        return this;
    }

    positive(): MVNumber<T> {
        this.lastValidator = 'positive';
        this.prebuiltValidators['positive'] = (v: number): boolean => !v || v <= 0;
        return this;
    }

    divideBy(arg: MVNumberArg<T>): MVNumber<T> {
        this.lastValidator = 'divideBy';
        this.prebuiltValidators['divideBy'] = (v: number, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v % compareValue !== 0;
        };
        return this;
    }
}
