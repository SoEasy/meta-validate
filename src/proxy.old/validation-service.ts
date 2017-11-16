// import { ProxyFieldConfig } from './proxy-field-config';
// import { ProxyConfig } from './proxy-config';
import { ProxyValidationResult } from 'proxy/interfaces';

export function validate(
    field: string,
    instance: any
): ProxyValidationResult {
    // const fieldConfig: ProxyFieldConfig = proxyConfig.getFieldConfig(field);
    const fieldErrors = instance.validateField(field);
    return fieldErrors;
}
