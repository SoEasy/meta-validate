import {MVValidity} from './interfaces';

/**
 * @description Хранилище данных о валидности полей с вспомогательным методом проверки на полную валидность
 */
export class Validity {
    validity: MVValidity;
    errors: MVValidity;

    isFullValid(): boolean {
        for (const fieldKey of Object.keys(this.validity)) {
            const fieldValidity = this.validity[fieldKey];
            for (const validityKey of Object.keys(fieldValidity)) {
                if (!fieldValidity[validityKey]) {
                    return false;
                }
            }
        }
        return true;
    }
}
