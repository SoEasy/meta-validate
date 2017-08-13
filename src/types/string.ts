import { MVBase } from './base';
import { IBaseDecoratorType } from '../interfaces';

export type MVStringArg<ArgType, InstanceType> = ArgType | ((instance: InstanceType) => ArgType);

export class MVString<T> extends MVBase implements IBaseDecoratorType {
    required(): MVString<T> {
        super.required();
        return this;
    }

    if(condition: (i: any) => boolean): MVString<T> {
        super.if(condition);
        return this;
    }

    skip(condition: (i: T) => boolean): MVString<T> {
        super.skip(condition);
        return this;
    }

    with(fields: Array<string>): MVString<T> {
        super.with(fields);
        return this;
    }

    convert(): MVString<T> {
        this.converters.push((value: any) => {
            return !value ? value : value.toString();
        });
        return this;
    }

    minLength(arg: MVStringArg<number, T>): MVString<T> {
        this.lastValidator = 'minLength';
        this.prebuiltValidators['minLength'] = (v: string, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length < compareValue;
        };
        return this;
    }

    maxLength(arg: MVStringArg<number, T>): MVString<T> {
        this.lastValidator = 'maxLength';
        this.prebuiltValidators['maxLength'] = (v: string, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length > compareValue;
        };
        return this;
    }

    length(arg: MVStringArg<number, T>): MVString<T> {
        this.lastValidator = 'length';
        this.prebuiltValidators['length'] = (v: string, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length !== compareValue;
        };
        return this;
    }

    regex(pattern: MVStringArg<RegExp, T>, name: string): MVString<T> {
        this.lastValidator = name;
        this.prebuiltValidators[name] = (v: string, i: T): boolean => {
            const compareValue = typeof pattern === 'function' ? pattern(i) : pattern;
            if (!compareValue) {
                console.warn(`RegExp validator '${name}' return null pattern`);
            }
            return !v || !compareValue || !compareValue.test(v);
        };
        return this;
    }

    /**
     * @description Allow only a-z A-Z 0-9
     */
    alphanum(): MVString<T> {
        this.lastValidator = 'alphanum';
        this.prebuiltValidators['alphanum'] = (v: string): boolean => {
            return !v || /^[a-zA-Z0-9]+$/.test(v);
        };
        return this;
    }

    /**
     * @description Allow only a-z A-Z 0-9 - _
     */
    token(): MVString<T> {
        this.lastValidator = 'token';
        this.prebuiltValidators['token'] = (v: string): boolean => {
            return !v || /^[a-zA-Z0-9_\-]+$/.test(v);
        };
        return this;
    }
}
