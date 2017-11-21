import { CQRS } from './../cqrs';
import { IProxyFieldConfig } from './../interfaces';

export class DecorateFieldCommand extends CQRS.BaseCommand {
    config: IProxyFieldConfig;
    field: string;
    targetClass: any;
}
