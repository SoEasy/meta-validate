import { IMVFieldValidity, IMVValidators, MVValidator, ReceiveValidity } from './interfaces';
import { ValidateRelationStore } from './relation-store';

const VALIDATE_FIELDS_KEY = 'JsonNameValidateFields';

/**
 * @description Функция запустит валидаторы для значения
 * @param newVal - новое значение, которое надо провалидировать
 * @param validators - массив
 * @param context - экземпляр класса, поле которого валидируем
 * @return {IMVFieldValidity}
 */
function runValidators<T>(newVal: any, validators: Array<MVValidator<T>>, context: any): IMVFieldValidity {
    const errors: Record<string, boolean> = {};
    if (validators) {
        for (const validationErrorKey of Object.keys(validators)) {
            const validity = validators[validationErrorKey](newVal, context);
            if (!errors[validationErrorKey]) {
                errors[validationErrorKey] = validity;
            }
        }
    }
    return errors;
}

function makeDecorator<T>(
    validationNeeded: boolean,
    validators?: IMVValidators<T>,
    validateWith?: Array<string>,
    nested: boolean = false
): any {
    validators = validators || {};
    return (target: T, propertyKey: keyof T): PropertyDescriptor => {
        const existValidateMetadata =
            (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, target) || new ValidateRelationStore();

        if (validationNeeded) {
            existValidateMetadata.addValidators(propertyKey, validators);
            if (validateWith) {
                existValidateMetadata.addValidateRelation(propertyKey, validateWith);
            }
            (Reflect as any).defineMetadata(VALIDATE_FIELDS_KEY, existValidateMetadata, target);
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
            const _this: any = this;
            const currentVal = originalGet.call(_this);
            originalSet.call(_this, newVal);
            if (newVal !== currentVal) {
                const validateKeyMetadata = (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, target);
                const fieldValidators = existValidateMetadata.getValidators(propertyKey);
                // Валидация самого поля
                if (validationNeeded) {
                    const currentKeyErrors = runValidators(newVal, fieldValidators, _this);
                    existValidateMetadata.setFieldErrors(propertyKey, currentKeyErrors);
                }

                // Валидация связанных полей
                const relatedFields = validateKeyMetadata.getRelatedFields(propertyKey);
                for (const relatedField of relatedFields) {
                    const relatedValidators = validateKeyMetadata.getValidators(relatedField);
                    const relatedFieldValue = _this[relatedField];
                    const relatedKeyErrors = runValidators(relatedFieldValue, relatedValidators, _this);
                    validateKeyMetadata.setFieldErrors(relatedField, relatedKeyErrors);
                }

                if (nested && (newVal as any).validity) {
                    (newVal as any).validity.subscribe(
                        nestedValidity => {
                            validateKeyMetadata.setFieldErrors(propertyKey, nestedValidity.errors);
                            _this.validity.next(validateKeyMetadata.getErrors());
                        }
                    );
                }

                _this.validity.next(validateKeyMetadata.getErrors());
            }
        };
        Object.defineProperty(target, propertyKey, descriptor);
        return descriptor;
    };
}

export function ValidationTrigger<T>(): any {
    return makeDecorator<T>(false);
}

export function Validate<T>(validators: IMVValidators<T>, validateWith?: Array<string>): any {
    return makeDecorator<T>(true, validators, validateWith);
}

export function ValidateNested<T extends ReceiveValidity>(validateWith?: Array<string>): any {
    return makeDecorator<T>(false, {}, validateWith, true);
}
