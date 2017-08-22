import { MVValidator, MVFieldValidity, VALIDATE_FIELDS_KEY } from './interfaces';
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

    private validatorConditions: Record<string, Record<string, (instance: any) => boolean>> = {};

    /**
     * @description Хранилище вложенных полей, чтобы лишний раз не дергать метадату при валидации зависимых полей
     */
    private nestedFields: Array<string> = [];

    /**
     * @description Хранилище ошибок валидации
     */
    private errorsStore: Validity = new Validity();

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

    toSkipValidation(field: string, instance: any): boolean {
        return this.skipConditions[field] ? this.skipConditions[field](instance) : false;
    }

    validateField(field: string, newVal: any, instance: any): void {
        const errors: MVFieldValidity = {};

        const validators = this.getValidators(field);
        const skipValidation = this.toSkipValidation(field, instance);

        const isNestedField = this.nestedFields.includes(field);
        if (isNestedField) {
            if (skipValidation) {
                return this.setFieldErrors(field, {});
            }
            return this.validateNestedField(newVal);
        }

        if (validators) {
            for (const validationErrorKey of Object.keys(validators)) {
                const skipValidator = this.validatorConditions[field][validationErrorKey]
                    ? this.validatorConditions[field][validationErrorKey](instance)
                    : false;
                if (skipValidation || skipValidator) {
                    errors[validationErrorKey] = false;
                    continue;
                }
                const validity = validators[validationErrorKey](newVal, instance);
                errors[validationErrorKey] = validity;
            }
        }
        this.setFieldErrors(field, errors);
    }

    validateReleatedFields(field: string, instance: any): void {
        const relatedFields = this.getRelatedFields(field);
        for (const relatedField of relatedFields) {
            const relatedFieldValue = instance[relatedField];
            const isNestedField = this.nestedFields.includes(relatedField);
            if (isNestedField) {
                this.validateNestedField(relatedFieldValue);
            } else {
                this.validateField(relatedField, relatedFieldValue, instance);
            }
        }
    }

    // TODO возможно этого тут быть не должно
    private validateNestedField(value: any): void {
        if (!value) { return; }
        const nestedMetadata: ValidateRelationStore = (Reflect as any).getMetadata(VALIDATE_FIELDS_KEY, Object.getPrototypeOf(value));
        if (!nestedMetadata) { return; }
        for (const nestedField of Object.keys(nestedMetadata.validatorsStore)) {
            nestedMetadata.validateField(nestedField, value[nestedField], value);
        }
    }

    private getRelatedFields(key: string): Array<string> {
        return this.fieldsRelationsStore[key] || [];
    }

    private getValidators(field: string): Record<string, MVValidator> {
        return this.validatorsStore[field] || {};
    }

    private setFieldErrors(field: string, validity: MVFieldValidity): void {
        this.errorsStore.errors[field] = validity;
    }

    getErrors(): Validity {
        return this.errorsStore;
    }
}
