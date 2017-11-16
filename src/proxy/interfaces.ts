/**
 * Сигнатура функции-валидатора для библиотеки
 * Функция принимает два параметра - значение, которое нужно провалидировать и экземпляр класса, который валидируется
 * Возвращает true, если есть ошибка
 */
export type IProxyValidator<ValueType = any, InstanceType = any> = (value: ValueType, instance?: InstanceType) => boolean;

/**
 * Интерфейс хранимых ошибок валидации. Поддерживает вложенность
 */
export interface IProxyValidationResult {
    [fieldName: string]: Record<string, boolean> | IProxyValidationResult;
}

export interface IPartialValidityMeta {
    cb: (result: IProxyValidationResult) => void;
    fields: Array<string>;
}

export interface IProxyFieldConfig {
    destName: string;
    requiredValues: Array<any>;
    debounce: number;
    manual: boolean;
    withFields: Array<string>;
    validatorsStore: Record<string, IProxyValidator>;
    skipCondition: (instance: any) => boolean;
    skipValidatorConditions: Record<string, (instance: any) => boolean>;
    isNested: boolean;
    isTrigger: boolean;
}
