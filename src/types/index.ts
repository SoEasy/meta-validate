import { MVNumber } from './number';
import { MVString } from './string';
import { MVBase } from './base';

export class MetaValidate {
    static Number<T>(): MVNumber<T> {
        return new MVNumber<T>();
    }

    static String<T>(): MVString<T> {
        return new MVString<T>();
    }

    static Trigger(): any {
        const retVal = new MVBase();
        retVal.isTrigger = true;
        return retVal.make;
    }

    static Nested(): any {
        const retVal = new MVBase();
        retVal.isNested = true;
        return retVal.make;
    }
}
