import { IProxyValidator, IProxyFieldConfig } from 'proxy/interfaces';

export class ProxyFieldConfig implements IProxyFieldConfig {
    /**
     * Имя поля в источнике данных, куда будет складываться переданное значение
     */
    destName: string;

    /**
     * Если поле required и его значение попадает в переданные - будет ошибка required
     */
    requiredValues: Array<any> = [null, undefined];

    /**
     * Задержка перед валидацией
     */
    debounce: number;

    /**
     * Если стоит этот флаг - поле по сеттеру не запустит валидацию. Вызвать валидацию этого поля можно только извне
     * или по with
     * Игнорирует debounce
     */
    manual: boolean;

    /**
     * Поля, при изменении которых надо провалидировать данное
     */
    withFields: Array<string> = [];

    /**
     * Хранилище валидаторов для поля. Ключ - имя валидатора, значение - функция валидатора
     */
    validatorsStore: Record<string, IProxyValidator> = {};

    /**
     * Хранилище условий, при которых всю валидацию поля нужно игнорировать. Ключ - поле, значение - функция
     */
    skipCondition: (instance: any) => boolean;

    /**
     * Хранилище условий, при которых нужно пропустить определенный валидатор. Ключ - поле, значение -
     * объект, где ключ - имя валидатора, значение - условие
     */
    skipValidatorConditions: Record<string, (instance: any) => boolean> = {};

    /**
     * Флаг, что поле является вложеным
     */
    isNested: boolean = false;

    /**
     * Флаг, что поле является значимым, его надо пробрасывать в source/dest, но не содержит валидаций.
     * На него можно завязывать with других полей
     */
    isTrigger: boolean = false;
}
