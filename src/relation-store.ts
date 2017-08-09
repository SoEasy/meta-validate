import { IMVFieldValidity, IMVValidators } from './interfaces';
import { Validity } from './validity';

/**
 * @description Хранилище информации, необходимой для работы валидаторов.
 * Хранит сами валидаторы, созависимые поля и результаты валидации
 */
export class ValidateRelationStore {
    private fieldsRelationsStore: Record<string, Array<string>> = {};
    private validatorsStore: Record<string, IMVValidators<any>> = {};
    private errorsStore: Validity = new Validity();

    addValidateRelation(key: string, fields: Array<string>): void {
        if (!fields || !fields.length) {
            console.warn(`No related fields specified for validation field ${key}`);
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

    getRelatedFields(key: string): Array<string> {
        return this.fieldsRelationsStore[key] || [];
    }

    addValidators(key: string, validators: IMVValidators<any>): void {
        this.validatorsStore[key] = { ...this.validatorsStore[key], ...validators };
        const existsValidators = this.validatorsStore[key] || {};
        for (const invalidKey of Object.keys(validators)) {
            existsValidators[invalidKey] = validators[invalidKey];
        }
    }

    getValidators(key: string): IMVValidators<any> {
        return this.validatorsStore[key] || {};
    }

    setFieldErrors(key: string, validity: IMVFieldValidity): void {
        this.errorsStore.errors[key] = validity;
    }

    getErrors(): Validity {
        return this.errorsStore;
    }
}
