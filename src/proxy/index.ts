import { MakeDecoratorCommandHandler } from './command-handlers/make-decorator.handler';
import { RegisterProxyFieldCommandHandler } from './command-handlers/register-proxy-field.handler';
import { PassValueCommandHandler } from './command-handlers/pass-value.handler';
import { ProxyFieldBuilder } from './utils/proxy-field-builder';

RegisterProxyFieldCommandHandler.register();
MakeDecoratorCommandHandler.register();
PassValueCommandHandler.register();

export class ProxyValidator {
    static get Validation(): ProxyFieldBuilder {
        return new ProxyFieldBuilder();
    }

    static get Nested(): any {
        return new ProxyFieldBuilder().nested().make();
    }

    static get Trigger(): any {
        // TODO Добавить проверку на количество аргументов. Чтобы декоратор работал как с вызовом, так и без
        return new ProxyFieldBuilder().trigger().make();
    }
}
