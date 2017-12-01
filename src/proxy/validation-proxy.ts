import { IValidationProxy, IProxyValidationResult } from './interfaces';
import { ProxyConfig } from './models/proxy-config';
import { ProxyRepository } from './proxy.repository';

export class ValidationProxy<T> {
    private dest: T;
    // private childProxies: Array<string> = [];
    private nestedName: string = null;
    private validityHandler: (validity: IProxyValidationResult) => void = null;
    $parent: IValidationProxy;
    validity: IProxyValidationResult = {};

    get proxyConfig(): ProxyConfig {
        return ProxyRepository.getProxyConfigByInstance(this);
    }

    /**
     * Присоединить источник/назначение данных
     * При присоединении прокси скопирует в себя все значимые для него поля
     */
    attachDataSource(data: T): void {
        this.dest = data;

        // TODO запустить команду "Пробросить в источник"
        for (const field of this.proxyConfig.significantFields) {
            if (this.proxyConfig.isFieldNested(field)) {
                // TODO подумать, как быть, когда nested-поле не инициализировано в источнике
                this[field].attachDataSource(data[field]);
                this[field].$parent = this;
                this[field].rememberNestedName(field);
            } else {
                this[field] = data[field];
            }
        }
        // this.selfValidate();
    }

    /**
     * Подписаться на проверку валидации
     */
    subscribeToValidity(cb: (validity: IProxyValidationResult) => void): void {
        this.validityHandler = cb;
    }
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
            if (this.proxyConfig.isFieldNested(field)) {
                Object.assign(retVal, {[field]: this[field].validate()});
            } else {
                Object.assign(retVal, {[field]: this.validateField(field)});
            }

        }
        return retVal;
    }

    validateAndAssign(): void {
        for (const field of this.proxyConfig.significantFields) {
            if (this.proxyConfig.isFieldNested(field)) {
                this[field].validateAndAssign();
                Object.assign(this.validity, {[field]: this[field].validity});
            } else {
                Object.assign(this.validity, {[field]: this.validateField(field)});
            }
        }
    }

    /**
     * Это надо дернуть, чтобы валидировать одно поле, которому выключена автоматическая валидация
     * Или использовать в служебных целях, чтобы получить валидность одного поля
     * Валидирует только свои поля, вглубь не ходит, не его ответственность
     */
    // TODO нужно унести в сервис валидации
    validateField(field: string): IProxyValidationResult {
        const validators = this.proxyConfig.getFieldValidators(field);
        const validatorNames = Object.keys(validators);
        const fieldValidationResult = {};
        for (const validatorName of validatorNames) {
            try {
                const mustSkip = this.proxyConfig.mustSkipValidators(field, this) ||
                                 this.proxyConfig.mustSkipValidator(field, validatorName, this);
                fieldValidationResult[validatorName] = mustSkip ? false : validators[validatorName](this[field], this);
            } catch (ex) {
                console.error(`Shit happens in validator "${validatorName}": ${ex.toString()}`);
            }
        }
        return fieldValidationResult;
    }

    assignValidity(field: string, validity: IProxyValidationResult): void {
        Object.assign(this.validity, {[field]: validity});
    }

    collectValidity(): void {
        for (const nestedField of this.proxyConfig.nestedFields) {
            this[nestedField].collectValidity();
            Object.assign(this.validity, { [nestedField]: this[nestedField].validity });
        }
    }

    emitValidity(): void {
        if (this.validityHandler) {
            this.validityHandler(this.validity);
        }
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
}
