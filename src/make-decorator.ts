import { VALIDATE_FIELDS_KEY } from './interfaces';
import { ValidateRelationStore } from './relation-store';
import { MVBase } from './types/base';
import { Validity } from './validity';

export function makeDecorator<T>(
    validationConfig: MVBase
): any {
    return (target: T, propertyKey: string): PropertyDescriptor => {
        if (!(Reflect as any).hasMetadata(VALIDATE_FIELDS_KEY, target)) {
            (Reflect as any).defineMetadata(VALIDATE_FIELDS_KEY, new ValidateRelationStore(), target);
        }
        const existValidateMetadata = (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, target);
        const errorKey = validationConfig.customErrorKey || propertyKey;
        existValidateMetadata.setupCustomErrorKey(propertyKey, errorKey);

        existValidateMetadata.addValidators(propertyKey, validationConfig.validators);
        if (validationConfig.validateWith) {
            existValidateMetadata.addValidateRelation(propertyKey, validationConfig.validateWith);
        }

        existValidateMetadata.setupSkipCondition(propertyKey, validationConfig.skipCondition);

        existValidateMetadata.setupValidatorConditions(propertyKey, validationConfig.validatorConditions);

        if (validationConfig.isNested) {
            existValidateMetadata.addNestedField(propertyKey);
        }

        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {
            configurable: true,
            enumerable: true
        };

        const valueStore = new WeakMap<any, T>();

        const originalGet = descriptor.get || function(): T | undefined {
            return valueStore.get(this as any);
        };
        const originalSet = descriptor.set || function(val: T): void {
            valueStore.set(this, val);
        };

        descriptor.get = originalGet;
        descriptor.set = function(newVal: T): void {
            const validateKeyMetadata = (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, target);
            const currentVal = originalGet.call(this);
            originalSet.call(this, newVal);

            const errorsStore = validateKeyMetadata.errorsStore;

            if (!errorsStore.has(this)) {
                errorsStore.set(this, new Validity());
            }

            if (newVal !== currentVal) {
                // Валидация самого поля
                // Если не триггер - валидируем
                if (!validationConfig.isTrigger) {
                    const fieldErrors = validateKeyMetadata.validateField(propertyKey, newVal, this);
                    setErrors(errorsStore, this, errorKey, fieldErrors);
                }

                // Валидация связанных полей
                const relatedErrors = validateKeyMetadata.validateRelatedFields(propertyKey, this);
                Object.assign(errorsStore.get(this).errors, relatedErrors);

                if (validationConfig.isNested) {
                    if (newVal && (newVal as any).validity$) {
                        (newVal as any).validity$.subscribe(
                            nestedValidity => {
                                if (!validateKeyMetadata.toSkipFieldValidation(propertyKey, this)) {
                                    setErrors(errorsStore, this, errorKey, nestedValidity.errors);
                                }
                                this.validity$.next(errorsStore.get(this));
                            }
                        );
                    } else {
                        const errors = validateKeyMetadata.validateField(propertyKey, newVal, this);
                        errorsStore.get(this).errors[errorKey] = errors;
                    }
                }

                this.validity$.next(errorsStore.get(this));
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
        return descriptor;
    };
}

function setErrors(wm: WeakMap<any, Validity>, instance: any, key: string, errors: any): void {
    const errorsStore = wm.get(instance).errors;
    if (!errorsStore[key]) {
        errorsStore[key] = errors;
    } else {
        Object.assign(errorsStore[key], errors);
    }
}
