import { MVBase } from './base';
import { IBaseDecoratorType } from '../interfaces';

export type MVStringArg<ArgType, InstanceType> = ArgType | ((instance: InstanceType) => ArgType);

export class MVString<T> extends MVBase implements IBaseDecoratorType {
    required(): MVString<T> {
        super.required();
        return this;
    }

    skipIf(condition: (i: any) => boolean): MVString<T> {
        super.skipIf(condition);
        return this;
    }

    skip(condition: (i: T) => boolean): MVString<T> {
        super.skip(condition);
        return this;
    }

    with(fields: Array<string> | string, ...anotherFields: Array<string>): MVString<T> {
        super.with(fields, ...anotherFields);
        return this;
    }

    custom(name: string, validator: (value: string, instance: any) => boolean): MVString<T> {
        super.custom(name, validator);
        return this;
    }

    convert(): MVString<T> {
        this.converters.push((value: any) => {
            return !value ? value : value.toString();
        });
        return this;
    }

    minLength(arg: MVStringArg<number, T>): MVString<T> {
        const validator = (v: string, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length < compareValue;
        };
        this.attachValidator('minLength', validator);
        return this;
    }

    maxLength(arg: MVStringArg<number, T>): MVString<T> {
        const validator = (v: string, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !!v && v.length > compareValue;
        };
        this.attachValidator('maxLength', validator);
        return this;
    }

    length(arg: MVStringArg<number, T>): MVString<T> {
        const validator = (v: string, i: T): boolean => {
            const compareValue = typeof arg === 'function' ? arg(i) : arg;
            return !v || v.length !== compareValue;
        };
        this.attachValidator('length', validator);
        return this;
    }

    regex(pattern: MVStringArg<RegExp, T>, name: string): MVString<T> {
        const validator = (v: string, i: T): boolean => {
            let compareValue = typeof pattern === 'function' ? pattern(i) : pattern;
            if (!compareValue) {
                console.warn(`RegExp validator '${name}' return null pattern`);
                return true;
            }
            compareValue = new RegExp(compareValue);
            return !v || !compareValue.test(v);
        };
        this.attachValidator(name, validator);
        return this;
    }

    /**
     * @description Allow only a-z A-Z 0-9
     */
    alphanum(): MVString<T> {
        const validator = (v: string): boolean => {
            return !v || /^[а-яА-Яa-zA-Z0-9]+$/.test(v);
        };
        this.attachValidator('alphanum', validator);
        return this;
    }

    /**
     * @description Allow only a-z A-Z 0-9 - _
     */
    token(): MVString<T> {
        const validator = (v: string): boolean => {
            return !v || /^[a-zA-Z0-9_\-]+$/.test(v);
        };
        this.attachValidator('token', validator);
        return this;
    }
}
