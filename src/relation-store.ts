import { MVValidator, MVFieldValidity, VALIDATE_FIELDS_KEY, MVValidity } from './interfaces';
import { Validity } from './validity';

/**
 * @description Хранилище информации, необходимой для работы валидаторов.
 * Хранит сами валидаторы, созависимые поля и результаты валидации
 */
export class ValidateRelationStore {
    /**
     * @description Хранилище зависимостей полей. Ключ - поле, значение - поля, которые надо провалидировать при его изменении
     */
    private fieldsRelationsStore: Record<string, Array<string>> = {};

    /**
     * @description Хранилище валидаторов для поля. Ключ - поле, значение - объект с валидаторами
     */
    private validatorsStore: Record<string, Record<string, MVValidator>> = {};

    /**
     * @description Хранилище условий, при которых поле нужно валидировать. Ключ - поле, значение - функция
     */
    private skipConditions: Record<string, (instance: any) => boolean> = {};

    /**
     * @description Хранилище условий, при которых нужно запускать определенный валидатор. Ключ - поле, значение -
     * рекорд, где ключ - валидатор, значение - условие
     */
    private validatorConditions: Record<string, Record<string, (instance: any) => boolean>> = {};

    /**
     * @description Хранилище вложенных полей, чтобы лишний раз не дергать метадату при валидации зависимых полей
     */
    private nestedFields: Array<string> = [];

    errorsStore: WeakMap<any, Validity> = new WeakMap();

    addValidators(key: string, validators: Record<string, MVValidator>): void {
        this.validatorsStore[key] = { ...this.validatorsStore[key], ...validators };
        const existsValidators = this.validatorsStore[key] || {};
        for (const invalidKey of Object.keys(validators)) {
            existsValidators[invalidKey] = validators[invalidKey];
        }
    }

    addNestedField(field: string): void {
        this.nestedFields.push(field);
    }

    addValidateRelation(key: string, fields: Array<string>): void {
        if (!fields || !fields.length) {
            return;
        }
        const passedTypes: Array<string> = fields.map(f => typeof f);
        if (new Set(passedTypes).size !== 1) {
            throw new Error(`Invalid field keys specified. String expecting, got ${passedTypes.toString()}`);
        }
        if (!passedTypes.includes('string')) {
            throw new Error(`Invalid field keys specified. String expecting, got ${passedTypes.toString()}`);
        }

        for (const field of fields) {
            const validateAfterFields = this.fieldsRelationsStore[field] || [];
            if (!validateAfterFields.includes(key)) {
                validateAfterFields.push(key);
            }
            this.fieldsRelationsStore[field] = validateAfterFields;
        }
    }

    setupSkipCondition(field: string, condition: (instance: any) => boolean): void {
        this.skipConditions[field] = condition;
    }

    setupValidatorConditions(field: string, conditions: Record<string, (instance: any) => boolean>): void {
        this.validatorConditions[field] = conditions;
    }

    /**
     * @description Условие полного скипа валидации
     */
    toSkipFieldValidation(field: string, instance: any): boolean {
        return this.skipConditions[field] ? this.skipConditions[field](instance) : false;
    }

    toSkipValidator(field: string, validatorKey: string, instance: any): boolean {
        return this.validatorConditions[field][validatorKey]
            ? this.validatorConditions[field][validatorKey](instance)
            : false;
    }

    validateField(field: string, newVal: any, instance: any): MVFieldValidity {
        const skipValidation = this.toSkipFieldValidation(field, instance);

        let errors: MVFieldValidity = {};
        const validators = this.getValidators(field);

        if (validators) {
            for (const validationErrorKey of Object.keys(validators)) {
                const skipValidator = this.toSkipValidator(field, validationErrorKey, instance);
                if (skipValidation || skipValidator) {
                    errors[validationErrorKey] = false;
                    continue;
                }
                const validity = validators[validationErrorKey](newVal, instance);
                errors[validationErrorKey] = validity;
            }
        }

        const isNestedField = this.nestedFields.includes(field);
        if (isNestedField) {
            errors = { ...errors, ...this.validateNestedField(newVal) };
        }

        return errors;
    }

    validateRelatedFields(field: string, instance: any): MVValidity {
        const relatedFields = this.getRelatedFields(field);
        const errors = {};
        for (const relatedField of relatedFields) {
            const relatedFieldValue = instance[relatedField];
            errors[relatedField] = this.validateField(relatedField, relatedFieldValue, instance);
        }
        return errors;
    }

    private validateNestedField(value: any): MVFieldValidity {
        if (!value) { return {}; }
        const nestedMetadata: ValidateRelationStore = (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, Object.getPrototypeOf(value));
        if (!nestedMetadata) { return {}; }
        const errors = {};
        for (const nestedField of Object.keys(nestedMetadata.validatorsStore)) {
            errors[nestedField] = nestedMetadata.validateField(nestedField, value[nestedField], value);
        }
        return errors;
    }

    private getRelatedFields(key: string): Array<string> {
        return this.fieldsRelationsStore[key] || [];
    }

    private getValidators(field: string): Record<string, MVValidator> {
        return this.validatorsStore[field] || {};
    }
    //
    // private setFieldErrors(field: string, validity: MVFieldValidity): void {
    //     this.errorsStore.errors[field] = validity;
    // }

    // getErrors(): Validity {
    //     return this.errorsStore;
    // }
}
