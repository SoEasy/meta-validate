import { ProxyFieldConfig } from 'proxy/proxy-field-config';

export function validate(field: string, fieldConfig: ProxyFieldConfig, instance: any): void {
    console.log('call validate', field, fieldConfig, instance);
}
