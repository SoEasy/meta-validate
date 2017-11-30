import { CQRS } from './../cqrs';
import { ChangeFieldCommand } from './../commands/change-field.command';
import { ProxyRepository } from './../proxy.repository';

export class ValidationCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = ChangeFieldCommand;

    /**
     * Метод вызывает все валидации полей в переданной прокси, которые зависят от переданного поля
     * Побочный эффект - сохраняет валидность вложенной прокси и эмитит её
     * @param nestedInstance - экземпляр вложенной прокси
     * @param {string} parentFieldName - имя поля, которое изменилось в родителе
     */
    private static validateRelatedProxyFields(nestedInstance: any, parentFieldName: string): void {
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(nestedInstance);
        for (const relatedField of proxyConfig.getRelatedField(parentFieldName)) {
            const relatedFieldValidationResult = nestedInstance.validateField(relatedField);
            nestedInstance.assignValidity(relatedField, relatedFieldValidationResult);
        }
        nestedInstance.emitValidity();
    }

    /**
     * стартовый метод, вызывается при изменении поля в проксе. Идет по вложенным проксям и заставляет их валидироваться
     * @param instance - экземпляр прокси, в которой поменялось поле
     * @param {string} changedField - имя поменявшегося поля
     */
    private static validateRelatedFieldsThroughNested(instance: any, changedField: string): void {
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(instance);
        const nestedFields = proxyConfig.nestedFields;
        for (const nestedField of nestedFields) {
            ValidationCommandHandler.validateRelatedProxyFields(instance[nestedField], changedField);
            ValidationCommandHandler.validateRelatedFieldsThroughNested(instance[nestedField], `$parent.${changedField}`);
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
    private static validateParentFields(instance: any, changedField: string): void {
        if (!instance.$parent) {
            return;
        }
        ValidationCommandHandler.validateRelatedProxyFields(instance.$parent, `${instance.nestedName}.${changedField}`);
        ValidationCommandHandler.validateRelatedFieldsThroughNested(instance.$parent, `${instance.nestedName}.${changedField}`);
        ValidationCommandHandler.validateParentFields(instance.$parent, `${instance.nestedName}.${changedField}`);
    }

    handle(command: ChangeFieldCommand): void {
        const instance = command.target;
        // TODO что-то делать при установке Nested-полей. А мб и так ок
        if (ProxyRepository.getProxyConfigByInstance(instance).nestedFields.includes(command.fieldName)) {
            return;
        }
        ValidationCommandHandler.validateRelatedFieldsThroughNested(instance, `$parent.${command.fieldName}`);
        ValidationCommandHandler.validateParentFields(instance, command.fieldName);

    }
}
