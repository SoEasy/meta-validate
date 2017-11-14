import { ProxyFieldConfig } from 'proxy/proxy-field-config';
import { ProxyValidator } from 'proxy/interfaces';

export class ProxyConfig {
    /**
     * По ключу поля лежит его конфиг
     */
    private fieldConfigs: Record<string, ProxyFieldConfig> = {};

    private initialized: boolean = false;

    /**
     * По ключу поля лежит поля, которые надо валидировать после него. Реверс with
     */
    private fieldsRelationStore: Record<string, Array<string>> = {};

    /**
     * Флаг, сообщающий, что уже можно присоединять источник/назначение данных
     * @return {boolean}
     */
    get isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Служебный метод, его вызовет переопределенный конструктор прокси-класса
     * До инициализации нельзя привязывать экземпляр данных
     * Так же это убережет пользователя от того, чтобы в прокси-классе задать дефолтные значения - их задавать НЕЛЬЗЯ
     * потому что это прокси - он не должен существовать сам по себе
     */
    init(): void {
        this.initialized = true;
    }

    /**
     * Регистрирует поле в общем конфиге прокси-класса, строит обратные зависимости полей
     */
    registerField(fieldName: string, config: ProxyFieldConfig): void {
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

    isFieldNested(field: string): boolean {
        return this.fieldConfigs[field].isNested;
    }

    getFieldConfig(field: string): ProxyFieldConfig {
        return this.fieldConfigs[field];
    }

    getFieldValidators(field: string): Record<string, ProxyValidator> {
        return this.fieldConfigs[field].validatorsStore;
    }
}
