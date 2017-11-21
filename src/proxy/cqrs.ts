export interface ICommand {
    dt: number;
}

export interface IQuery {
    dt: number;
}

export type CommandConstructor = new () => ICommand;

export type QueryConstructor = new () => IQuery;

export interface IBaseCommandHandler<T extends ICommand = any> {
    handle(command: T): void;
}

// TODO дженерики
export interface IBaseQueryHandler {
    handle(query: IQuery): any;
}

/**
 * Невидимый для пользователей фасад, который внутри используют все запросы и команды, регистрируясь в нем
 */
class CQFacade {
    private static commandHandlers: Map<CommandConstructor, Array<IBaseCommandHandler>> = new Map();
    private static queryHandlers: Map<QueryConstructor, IBaseQueryHandler> = new Map();

    static registerCommandHandler(commandType: CommandConstructor, handlerClass: IBaseCommandHandler): void {
        let handlers = CQFacade.commandHandlers.get(commandType);
        if (!handlers) {
            handlers = [];
            CQFacade.commandHandlers.set(commandType, handlers);
        }
        handlers.push(handlerClass);
    }

    static processCommand(command: ICommand): void {
        const handlers = CQFacade.commandHandlers.get(command.constructor as CommandConstructor);
        if (!handlers || !handlers.length) {
            console.error(`No handlers registered for command type "${command.constructor.name}"`);
            return;
        }
        handlers.forEach((HandlerConstructor: any) => {
            const handlerInstance: IBaseCommandHandler = new HandlerConstructor();
            handlerInstance.handle(command);
        });
    }

    static registerQueryHandler(queryType: QueryConstructor, handlerClass: IBaseQueryHandler): void {
        const handler = CQFacade.queryHandlers.get(queryType);
        if (handler) {
            console.error(`Query handler  for query type "${queryType.name}" already registered`);
        }
        CQFacade.queryHandlers.set(queryType, handlerClass);
    }

    static processQuery(query: IQuery): any {
        const HandlerClass: any = CQFacade.queryHandlers.get(query.constructor as any);
        if (!HandlerClass) {
            console.error(`No handler registered for query type "${query.constructor.name}"`);
        }
        const handlerInstance: IBaseQueryHandler = new HandlerClass();
        return handlerInstance.handle(query);
    }
}

export abstract class BaseCommandHandler<T extends ICommand = any> implements IBaseCommandHandler<T> {
    static commandType: any;

    static register(): void {
        CQFacade.registerCommandHandler(this.commandType, this as any);
    }

    abstract handle(command: T): void;
}

export abstract class BaseQueryHandler implements IBaseQueryHandler {
    static queryType: any;

    static register(): void {
        CQFacade.registerQueryHandler(this.queryType, this as any);
    }

    abstract handle(query: any): any;
}

export class BaseQuery implements IQuery {
    dt: number = Number(new Date());

    do(): any {
        return CQFacade.processQuery(this);
    }
}

export class BaseCommand implements ICommand {
    dt: number = Number(new Date());

    do(): void {
        CQFacade.processCommand(this);
    }
}

export const CQRS = {
    BaseCommand,
    BaseCommandHandler,
    BaseQuery,
    BaseQueryHandler
};