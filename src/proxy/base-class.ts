import { ProxyValidationResult } from 'proxy/interfaces';

export class MetaValidateProxy<T> {
    private dest: T;

    constructor() {
        console.log('costructor', this);
    }
    /**
     * Присоединить источник/назначение данных
     * При присоединении прокси скопирует в себя все значимые для него поля
     */
    attachDataSource(data: T): void {
        this.dest = data;
    }

    /**
     * Подписаться на проверку валидации
     */
    subscribeToValidity(cb: (validity: ProxyValidationResult) => void): void {
        console.log('subscribe to validity', cb);
    }

    /**
     * Зарегистрировать частичную проверку валидации, проверяющую только переданные поля
     */
    registerPartialValidity(validityName: string, fields: Array<string>): void {
        console.log('register part validity', validityName, fields);
    }

    /**
     * Подписаться на частичную проверку валидации
     */
    subscribeToPartialValidity(validityName: string, cb: (validity: ProxyValidationResult) => void): void {
        console.log('subscribe part validity', validityName, cb);
    }

    /**
     * Вызвать полную валидацию объекта
     */
    validate(): ProxyValidationResult {
        console.log('full validate');
        return {};
    }

    /**
     * Это надо дернуть, чтобы валидировать одно поле, которому выключена автоматическая валидация
     */
    validateField(field: string): ProxyValidationResult {
        console.log('validate field', field);
        return {};
    }

    passDataToDest(fieldName: string, value: any): void {
        this.dest[fieldName] = value;
    }
}
