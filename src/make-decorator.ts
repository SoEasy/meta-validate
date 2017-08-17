import { VALIDATE_FIELDS_KEY } from './interfaces';
import { ValidateRelationStore } from './relation-store';
import { MVBase } from './types/base';
import 'reflect-metadata';

export function makeDecorator<T>(
    validationConfig: MVBase
): any {
    return (target: T, propertyKey: keyof T): PropertyDescriptor => {
        if (!Reflect.hasMetadata(VALIDATE_FIELDS_KEY, target)) {
            Reflect.defineMetadata(VALIDATE_FIELDS_KEY, new ValidateRelationStore(), target);
        }
        const existValidateMetadata = Reflect.getMetadata(VALIDATE_FIELDS_KEY, target);

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

        const wm = new WeakMap<any, T>();

        const originalGet = descriptor.get || function(): T | undefined {
            return wm.get(this as any);
        };
        const originalSet = descriptor.set || function(val: T): void {
            wm.set(this, val);
        };

        descriptor.get = originalGet;
        descriptor.set = function(newVal: T): void {
            // tslint:disable-next-line
            const currentVal = originalGet.call(this);
            originalSet.call(this, newVal);

            if (newVal !== currentVal) {
                const validateKeyMetadata = (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, target);

                // Валидация самого поля
                // Если не триггер - валидируем
                if (!validationConfig.isTrigger) {
                    validateKeyMetadata.validateField(propertyKey, newVal, this);
                }

                // Валидация связанных полей
                validateKeyMetadata.validateReleatedFields(propertyKey, this);

                if (validationConfig.isNested && (newVal as any).validity$) {
                    (newVal as any).validity$.subscribe(
                        nestedValidity => {
                            validateKeyMetadata.setFieldErrors(propertyKey, nestedValidity.errors);
                            this.validity$.next(validateKeyMetadata.getErrors());
                        }
                    );
                }

                this.validity$.next(validateKeyMetadata.getErrors());
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
        return descriptor;
    };
}
