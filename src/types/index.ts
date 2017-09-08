import { MVNumber } from './number';
import { MVString } from './string';
import { MVBase } from './base';
export { MVBase } from './base';

export class MetaValidate {
    private static customValidatorsStore: WeakMap<any, any> = new WeakMap();

    static Number<T>(customName?: string): MVNumber<T> {
        return new MVNumber<T>(customName);
    }

    static String<T>(customName?: string): MVString<T> {
        return new MVString<T>(customName);
    }

    static Trigger(): MVBase {
        const retVal = new MVBase();
        retVal.isTrigger = true;
        return retVal;
    }

    static Nested(customName?: string): MVBase {
        const retVal = new MVBase(customName);
        retVal.isNested = true;
        return retVal;
    }

    static Base(customName?: string): MVBase {
        return new MVBase(customName);
    }

    static Register<T extends MVBase>(validatorsClass: new() => T): void {
        MetaValidate.customValidatorsStore.set(validatorsClass, validatorsClass);
    }

    static Get<T extends MVBase>(validatorClass: new() => T): T {
        if (!MetaValidate.customValidatorsStore.has(validatorClass)) {
            throw new Error(`No validators registered for class ${validatorClass.name}`);
        }
        const validatorsConstructor = MetaValidate.customValidatorsStore.get(validatorClass);
        return new validatorsConstructor();
    }
}
