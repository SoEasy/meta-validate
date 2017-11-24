import { IProxyFieldConfig, IProxyValidator, IPartialValidityMeta } from './../interfaces';

export class ProxyConfig {
    /**
     * По ключу поля лежит его конфиг
     */
    private fieldConfigs: Record<string, IProxyFieldConfig> = {};

    /**
     * По ключу поля лежит поля, которые надо валидировать после него. Реверс with
     */
    private fieldsRelationStore: Record<string, Array<string>> = {};

    // // TODO это должно быть не здесь - это надо уносить в метахранилище
    // validationCb: (validationResult: IProxyValidationResult) => void;
    partialValidityStore: Record<string, IPartialValidityMeta> = {};

    /**
     * Регистрирует поле в общем конфиге прокси-класса, строит обратные зависимости полей
     */
    registerField(fieldName: string, config: IProxyFieldConfig): void {
        this.fieldConfigs[fieldName] = config;
        for (const withField of config.withFields) {
            const relatedFields = this.fieldsRelationStore[withField] || [];
            relatedFields.push(fieldName);
            this.fieldsRelationStore[withField] = relatedFields;
        }
    }

    /**
     * Получить список значимых полей, которые проксируются
     */
    get significantFields(): Array<string> {
        return Object.keys(this.fieldConfigs);
    }

    getRelatedField(field: string): Array<string> {
        return this.fieldsRelationStore[field] || [];
    }

    isFieldNested(field: string): boolean {
        return this.fieldConfigs[field].isNested;
    }

    getFieldConfig(field: string): IProxyFieldConfig {
        return this.fieldConfigs[field];
    }

    getFieldValidators(field: string): Record<string, IProxyValidator> {
        return this.fieldConfigs[field].validatorsStore;
    }

    get nestedFields(): Array<string> {
        return Object.keys(this.fieldConfigs).filter(
            key => this.fieldConfigs[key].isNested
        );
    }
}
