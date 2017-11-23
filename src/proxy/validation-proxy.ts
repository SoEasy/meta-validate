import { IValidationProxy, IProxyValidationResult } from './interfaces';
import { ProxyConfig } from './models/proxy-config';
import { ProxyRepository } from './proxy.repository';

export class ValidationProxy<T> {
    private dest: T;
    private childProxies: Array<string> = [];
    private proxyConfig: ProxyConfig;
    private nestedName: string = null;
    $parent: IValidationProxy;
    validity: IProxyValidationResult = {};

    constructor() {
        // убрать в запросы
        this.proxyConfig = ProxyRepository.getOrCreateProxyConfig(this.constructor.prototype);
    }

    /**
     * Присоединить источник/назначение данных
     * При присоединении прокси скопирует в себя все значимые для него поля
     */
    attachDataSource(data: T): void {
        this.dest = data;

        for (const field of this.proxyConfig.significantFields) {
            if (this.proxyConfig.isFieldNested(field)) {
                // TODO подумать, как быть, когда nested-поле не инициализировано в источнике
                this[field].attachDataSource(data[field]);
                this[field].$parent = this;
                this[field].rememberNestedName(field);
                this.childProxies.push(field);
            } else {
                this[field] = data[field];
            }
        }
    }
    //
    // /**
    //  * Подписаться на проверку валидации
    //  */
    // subscribeToValidity(cb: (validity: IProxyValidationResult) => void): void {
    //     console.log('subscribe to validity', cb);
    // }
    //
    // /**
    //  * Зарегистрировать частичную проверку валидации, проверяющую только переданные поля
    //  */
    // registerPartialValidity(validityName: string, fields: Array<string>): void {
    //     console.log('register part validity', validityName, fields);
    // }
    //
    // /**
    //  * Подписаться на частичную проверку валидации
    //  */
    // subscribeToPartialValidity(validityName: string, cb: (validity: IProxyValidationResult) => void): void {
    //     console.log('subscribe part validity', validityName, cb);
    // }

    /**
     * Вызвать полную валидацию объекта
     */
    validate(): IProxyValidationResult {
        const retVal = {};
        for (const field of this.proxyConfig.significantFields) {
            Object.assign(retVal, {[field]: this.validateField(field)});
        }
        return retVal;
    }

    /**
     * Это надо дернуть, чтобы валидировать одно поле, которому выключена автоматическая валидация
     * Или использовать в служебных целях, чтобы получить валидность одного поля
     * Валидирует только свои поля, вглубь не ходит, не его ответственность
     */
    validateField(field: string): IProxyValidationResult {
        const validators = this.proxyConfig.getFieldValidators(field);
        const validatorNames = Object.keys(validators);
        const fieldValidationResult = {};
        for (const validatorName of validatorNames) {
            try {
                fieldValidationResult[validatorName] = validators[validatorName](this[field], this);
            } catch (ex) {
                console.error(`Shit happens in validator "${validatorName}": ${ex.toString()}`);
            }
        }
        return fieldValidationResult;
    }

    assignValidity(validity: IProxyValidationResult): void {
        Object.assign(this.validity, validity);
    }

    /**
     * На самом деле служебный метод, который дергают сеттеры чтобы прокинуть данные в источник
     */
    passDataToDest(fieldName: string, value: any): void {
        if (!this.proxyConfig.isFieldNested(fieldName)) {
            this.dest[fieldName] = value;
        }
    }

    /**
     * Запомнить имя вложенного поля для составления цепочек зависимостей
     */
    rememberNestedName(nestedName: string): void {
        this.nestedName = nestedName;
    }

    setupValidationResult(result: IProxyValidationResult): void {
        Object.assign(this.validity, result);
        if (this.$parent) {
            this.$parent.setupValidationResult(this.validity);
        }
    }

    // /**
    //  * Метод поднимает вверх событие изменения поля
    //  */
    // onChangeChildField(field: string): void {
    //     if (!this.$parent) {
    //         return;
    //     }
    //     if (field.includes('.')) {
    //         // run validation here
    //     }
    //     this.$parent.onChangeChildField(`${this.nestedName}.${field}`);
    // }
    //
    // /**
    //  * Метод спускает во вложенные прокси событие изменения поля
    //  */
    // onChangeParentField(field: string): void {
    //     if (!this.childProxies.length) {
    //         return;
    //     }
    //     if (field.includes('.')) {
    //         // run validation here
    //     }
    //     for (const childProxyName of this.childProxies) {
    //         this[childProxyName].onChangeParentField(`$parent.${field}`);
    //     }
    // }
}
