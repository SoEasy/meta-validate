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

    static Trigger(): MVBase {
        const retVal = new MVBase();
        retVal.isTrigger = true;
        return retVal;
    }

    static Nested(): MVBase {
        const retVal = new MVBase();
        retVal.isNested = true;
        return retVal;
    }

    static Base(): MVBase {
        return new MVBase();
    }
}
