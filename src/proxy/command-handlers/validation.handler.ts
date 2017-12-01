import { CQRS } from './../cqrs';
import { ChangeFieldCommand } from './../commands/change-field.command';
import { ProxyRepository } from './../proxy.repository';

export class ValidationCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = ChangeFieldCommand;

    /**
     * Метод вызывает все валидации полей в переданной прокси, которые зависят от переданного поля
     * Побочный эффект - сохраняет валидность вложенной прокси и эмитит её
     * @param instance - экземпляр вложенной прокси
     * @param {string} parentFieldName - имя поля, которое изменилось в родителе
     */
    private static validateRelatedProxyFields(instance: any, parentFieldName: string): void {
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(instance);
        for (const relatedField of proxyConfig.getRelatedField(parentFieldName)) {
            const relatedFieldValidationResult = instance.validateField(relatedField);
            instance.assignValidity(relatedField, relatedFieldValidationResult);
        }
        instance.emitValidity();
    }

    /**
     * стартовый метод, вызывается при изменении поля в проксе. Идет по вложенным проксям и заставляет их валидироваться
     * @param instance - экземпляр прокси, в которой поменялось поле
     * @param {string} changedField - имя поменявшегося поля
     */
    private static walkDown(instance: any, changedField: string): void {
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
    private static walkUp(instance: any, changedField: string): void {
        if (!instance.$parent) {
            return;
        }
        ValidationCommandHandler.validateRelatedProxyFields(instance.$parent, `${instance.nestedName}.${changedField}`);
        ValidationCommandHandler.walkDown(instance.$parent, `${instance.nestedName}.${changedField}`);
        ValidationCommandHandler.walkUp(instance.$parent, `${instance.nestedName}.${changedField}`);
    }

    handle(command: ChangeFieldCommand): void {
        const instance = command.target;
        instance.assignValidity(command.fieldName, instance.validateField(command.fieldName));
        // TODO что-то делать при установке Nested-полей. А мб и так ок
        if (ProxyRepository.getProxyConfigByInstance(instance).nestedFields.includes(command.fieldName)) {
            return;
        }
        ValidationCommandHandler.walkDown(instance, `$parent.${command.fieldName}`);
        ValidationCommandHandler.walkUp(instance, command.fieldName);
        let parentInstance = instance.$parent;
        if (!parentInstance) {
            instance.collectValidity();
            instance.emitValidity();
            return;
        }
        while (parentInstance.$parent) {
            parentInstance = parentInstance.$parent;
        }
    }
}
