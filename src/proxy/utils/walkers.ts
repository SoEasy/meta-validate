import { ProxyRepository } from './../proxy.repository';

/**
 * Класс для обхода прокси-объектов вверх и вниз
 */
export class ValidationWalker {
    constructor(private validationCb: (instance: any, changedField?: string) => void) {}

    /**
     * Вызывается при изменении поля в проксе. Идет по вложенным проксям и заставляет их валидироваться предложенным
     * коллбэком.
     * @param instance - экземпляр прокси, в которой поменялось поле
     * @param {string} changedField - имя поменявшегося поля - не обязательно
     */
    walkDown(instance: any, changedField: string = null): void {
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(instance);
        const nestedFields = proxyConfig.nestedFields;
        for (const nestedField of nestedFields) {
            this.validationCb(instance[nestedField], changedField);
            this.walkDown(instance[nestedField], `$parent.${changedField}`);
        }
    }

    walkUp(instance: any, changedField: string): void {
        if (!instance.$parent) {
            return;
        }
        this.validationCb(instance.$parent, `${instance.nestedName}.${changedField}`);
        this.walkDown(instance.$parent, `${instance.nestedName}.${changedField}`);
        this.walkUp(instance.$parent, `${instance.nestedName}.${changedField}`);
    }
}

export function validateRelatedFieldsThroughNested(instance: any, changedField: string): void {
    const proxyConfig = ProxyRepository.getProxyConfigByInstance(instance);
    const nestedFields = proxyConfig.nestedFields;
    for (const nestedField of nestedFields) {
        ValidationCommandHandler.validateRelatedProxyFields(instance[nestedField], changedField);
        ValidationCommandHandler.walkDown(instance[nestedField], `$parent.${changedField}`);
    }
}

/**
 * Стартовый метод, вызывается при изменении поля в проксе. Идет к родителю и дергает все его валидации,
 * связанные с изменившимся полем. Дергает:
 * - его личные валдиации
 * - спускает это в его детей, чтобы они тоже провалидировались
 * - поднимает это дальше вверх
 * @param instance - экземпляр прокси, в которой поменялось поле
 * @param {string} changedField - имя поменявшегося поля
 */
export function validateParentFields(instance: any, changedField: string): void {
    if (!instance.$parent) {
    return;
    }
    ValidationCommandHandler.validateRelatedProxyFields(instance.$parent, `${instance.nestedName}.${changedField}`);
    ValidationCommandHandler.walkDown(instance.$parent, `${instance.nestedName}.${changedField}`);
    ValidationCommandHandler.walkUp(instance.$parent, `${instance.nestedName}.${changedField}`);
}