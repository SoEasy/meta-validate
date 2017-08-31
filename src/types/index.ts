import { MVNumber } from './number';
import { MVString } from './string';
import { MVBase } from './base';

export class MetaValidate {
    static Number<T>(customName: string): MVNumber<T> {
        return new MVNumber<T>(customName);
    }

    static String<T>(customName: string): MVString<T> {
        return new MVString<T>(customName);
    }

    static Trigger(): MVBase {
        const retVal = new MVBase();
        retVal.isTrigger = true;
        return retVal;
    }

    static Nested(customName: string): MVBase {
        const retVal = new MVBase(customName);
        retVal.isNested = true;
        return retVal;
    }

    static Base(customName: string): MVBase {
        return new MVBase(customName);
    }
}
