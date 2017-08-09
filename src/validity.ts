import {MVValidity} from './interfaces';

/**
 * @description Хранилище данных о валидности полей с вспомогательным методом проверки на полную валидность
 */
export class Validity {
    errors: MVValidity = {};

    private static allFieldsIsFalse(obj: any, ignoreFields: Array<string> = [], currentChain: string = ''): boolean {
        for (const fieldKey of Object.keys(obj)) {
            const value = obj[fieldKey];
            const chainedCurrentField = currentChain ? `${currentChain}.${fieldKey}` : fieldKey;
            if (ignoreFields.includes(chainedCurrentField)) { continue; }
            for (const fieldValidation of Object.keys(value)) {
                const validationValue = value[fieldValidation];
                // if this is real validation value - check to false
                if (typeof validationValue === 'boolean') {
                    if (validationValue) { return false; }
                } else {
                    // validate deeper
                    const deeperValueIsFalse = Validity.allFieldsIsFalse(
                        value,
                        ignoreFields,
                        currentChain ? `${currentChain}.${fieldKey}` : fieldKey
                    );
                    // if not all deeper validations is false
                    if (!deeperValueIsFalse) { return false; }
                }
            }
        }
        return true;
    }

    isFullValid(ignoreFields: Array<string> = []): boolean {
        return Validity.allFieldsIsFalse(this.errors, ignoreFields);
    }
}
