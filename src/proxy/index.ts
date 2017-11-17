import { ProxyFieldBuilderService } from './services/proxy-field-builder';
import { MakeDecoratorService } from './services/make-decorator';
import { ProxyClassConfigService } from './services/proxy-class-config';

MakeDecoratorService.make();
ProxyClassConfigService.make();

export class ProxyValidator {
    static get Validation(): ProxyFieldBuilderService {
        return new ProxyFieldBuilderService();
    }

    static get Nested(): any {
        return new ProxyFieldBuilderService().nested().make();
    }

    static get Trigger(): any {
        return new ProxyFieldBuilderService().trigger().make();
    }
}
