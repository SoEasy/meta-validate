import { CQRS } from './../cqrs';
import { ChangeFieldCommand } from './../commands/change-field.command';
import { ProxyRepository } from './../proxy.repository';

export class ValidationCommandHandler extends CQRS.BaseCommandHandler {
    static commandType: any = ChangeFieldCommand;

    private static validateNestedRelatedFields(nestedInstance: any, parentFieldName: string): void {
        parentFieldName = `$parent.${parentFieldName}`;
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(nestedInstance);
        for (const relatedField of proxyConfig.getRelatedField(parentFieldName)) {
            const relatedFieldValidationResult = nestedInstance.validateField(relatedField);
            nestedInstance.assignValidity(relatedField, relatedFieldValidationResult);
        }
        console.log(nestedInstance.validity);
        nestedInstance.emitValidity();
    }

    private static validateRelatedFieldsThroughNested(instance: any, changedField: string): void {
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(instance);
        const nestedFields = proxyConfig.nestedFields;
        // const fieldErrors = instance.validateField(command.fieldName);
        for (const nestedField of nestedFields) {
            ValidationCommandHandler.validateNestedRelatedFields(instance[nestedField], changedField);
            ValidationCommandHandler.validateRelatedFieldsThroughNested(instance[nestedField], `$parent.${changedField}`);
        }
    }

    private static validateParentRelatedFields(instance: any, changedField: string): void {
        const proxyConfig = ProxyRepository.getProxyConfigByInstance(instance);
        for (const relatedField of proxyConfig.getRelatedField(changedField)) {
            const relatedFieldValidationResult = instance.validateField(relatedField);
            instance.assignValidity(relatedField, relatedFieldValidationResult);
        }
    }

    private static validateParentFields(instance: any, changedField: string): void {
        if (!instance.$parent) {
            return;
        }
        ValidationCommandHandler.validateParentRelatedFields(instance.$parent, `${instance.nestedName}.${changedField}`);
        console.log('PARENT VALIDITY', instance.$parent.validity);
        ValidationCommandHandler.validateRelatedFieldsThroughNested(instance.$parent, `${instance.nestedName}.${changedField}`);
        ValidationCommandHandler.validateParentFields(instance.$parent, `${instance.nestedName}.${changedField}`);
    }

    handle(command: ChangeFieldCommand): void {
        const instance = command.target;
        // TODO что-то делать при установке Nested-полей
        if (ProxyRepository.getProxyConfigByInstance(instance).nestedFields.includes(command.fieldName)) {
            return;
        }
        ValidationCommandHandler.validateRelatedFieldsThroughNested(instance, command.fieldName);
        ValidationCommandHandler.validateParentFields(instance, command.fieldName);

    }
}
