import { IProxyFieldConfig } from 'proxy/interfaces';

export class RegisterFieldEvent {
    config: IProxyFieldConfig;
    field: string;
    targetClass: any;
}
