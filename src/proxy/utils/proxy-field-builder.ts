import { ProxyFieldConfig } from '../models/proxy-field-config';
import { IProxyValidator } from '../interfaces';
import { DecorateFieldCommand } from './../commands/decorate-field.command';

export class ProxyFieldBuilder {
    private fieldConfig: ProxyFieldConfig = new ProxyFieldConfig();
    private lastValidator: string;

    /**
     * Принимает и устанавливает имя поля, к которому биндится поле прокси
     */
    setupDestName(name: string): ProxyFieldBuilder {
        this.fieldConfig.destName = name;
        return this;
    }

    /**
     * Принимает и устанавливает значения, при которых валидатор required должен выдавать true
     */
    setupRequiredValues(values: Array<any>): ProxyFieldBuilder {
        this.fieldConfig.requiredValues = values;
        return this;
    }

    /**
     * Принимает и устанавливает задержку, втечении которой не нужно вызывать валидаторы поля
     */
    debounce(delay: number): ProxyFieldBuilder {
        this.fieldConfig.debounce = delay;
        return this;
    }

    /**
     * Прокси больше не будет самостоятельно валидировать данное поле. Только при with или прямому вызову validateField
     */
    manual(): ProxyFieldBuilder {
        this.fieldConfig.manual = true;
        return this;
    }

    /**
     * Принимает и устанавливает поля, при изменении которых нужно провалидировать данное поле
     * Можно ходить вниз-вверх по вложенности объектов.
     * Например, если это поле гражданство, а рядом лежит документ, в котором есть тип, то можно прописать зависимость
     * ['document.docType']
     * Для похода вверх нужно использовать специальный ключ $parent.
     * Например волшебным образом случилось, что в модели есть поле "Нет улицы", а в поле "адрес" есть поле "Улица"
     * Для её валидации можно прописать зависимость ['$parent.noStreet']
     */
    with(fields: string | Array<string>): ProxyFieldBuilder {
        this.fieldConfig.withFields = Array.isArray(fields) ? fields : [fields];
        return this;
    }

    /**
     * Принимает функцию-условие, которая на вход получит инстанс и вернет - стоит запускать валидаторы или нет
     * Если условие возвращает true - валидация пропускается
     * Инстанс - это прокси-объект
     * TODO подумать на тему проброса в инстанс родителей
     */
    skip(condition: (instance: any) => boolean): ProxyFieldBuilder {
        this.fieldConfig.skipCondition = condition;
        return this;
    }

    /**
     * Регистрирует новый валидатор для поля. Пока принято решение не включать преднастроенные валидаторы в библиотеку
     * Запоминает указанный валидатор как последний
     * Возможно валидаторы будут отдельной библиотекой
     * @param {string} name - имя валидатора
     * @param {ProxyValidator} validator - функция валидации, на вход получает значение и инстанс. Возвращает true
     * если ошибка
     */
    validator(name: string, validator: IProxyValidator): ProxyFieldBuilder {
        this.lastValidator = name;
        this.fieldConfig.validatorsStore[name] = validator;
        return this;
    }

    /**
     * Принимает функцию-условие, при возврате которой true последний зарегистрированный валидатор будет игнорироваться
     * Сбрасывает запоминание последнего вылидатора
     * .validator('myAwesomeValidator', () => {...}).skipValidatorIf(() => {...})
     * @param {(instance: any) => boolean} condition - функция, принимающая инстанс и решающая - надо валидироваться
     * или нет
     */
    skipValidatorIf(condition: (instance: any) => boolean): ProxyFieldBuilder {
        if (!this.lastValidator) {
            console.warn('No validators registered, setup validator condition skipped');
            return this;
        }
        this.fieldConfig.skipValidatorConditions[this.lastValidator] = condition;
        this.lastValidator = null;
        return this;
    }

    nested(): ProxyFieldBuilder {
        this.fieldConfig.isNested = true;
        return this;
    }

    trigger(): ProxyFieldBuilder {
        this.fieldConfig.isTrigger = true;
        return this;
    }

    make(): any {
        return (targetClass: any, field: string): any => {
            const command = new DecorateFieldCommand();
            command.config = this.fieldConfig;
            command.targetClass = targetClass;
            command.field = field;
            command.do();
        };
    }
}
