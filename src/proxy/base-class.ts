import { ProxyValidationResult } from './interfaces';
import { ProxyConfig } from './proxy-config';

export class MetaValidateProxy<T> {
    private dest: T;
    private proxyConfig: ProxyConfig;
    private childProxies: Array<string> = [];
    private nestedName: string = null;

    // TODO interface for metavalidateproxy
    $parent: any;

    constructor() {
        this.proxyConfig = (Reflect as any).getMetadata('mvProxy', this);
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

    onChangeChildField(field: string): void {
        if (!this.$parent) {
            console.log('bubbling complete:', field);
            return;
        }
        this.$parent.onChangeChildField(`${this.nestedName}.${field}`);
    }

    onChangeParentField(field: string): void {
        if (!this.childProxies.length) {
            console.log('broadcasting complete', field);
            return;
        }
        for (const childProxyName of this.childProxies) {
            this[childProxyName].onChangeParentField(`$parent.${field}`);
        }
    }
}
