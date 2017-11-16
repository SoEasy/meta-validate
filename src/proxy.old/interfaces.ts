/**
 * Сигнатура функции-валидатора для библиотеки
 * Функция принимает два параметра - значение, которое нужно провалидировать и экземпляр класса, который валидируется
 * Возвращает true, если есть ошибка
 */
export type ProxyValidator<ValueType = any, InstanceType = any> = (value: ValueType, instance?: InstanceType) => boolean;

/**
 * Интерфейс хранимых ошибок валидации. Поддерживает вложенность
 */
export interface ProxyValidationResult {
    [fieldName: string]: Record<string, boolean> | ProxyValidationResult;
}

export interface PartialValidityMeta {
    cb: (result: ProxyValidationResult) => void;
    fields: Array<string>;
}
