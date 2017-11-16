export interface ActiveHandler {
    unregister: () => void;
}

export type EventHandler<EventType = any> = (event: EventType) => void;

/**
 * static-class шины для обмена сообщениями, без наворотов
 */
export /*static*/ class EventBus {
    private static eventHandlers: Map<string, Array<EventHandler>> = new Map();

    static on<EventType>(eventType: new () => EventType, handler: EventHandler<EventType>): ActiveHandler {
        let currentEventHandlers = EventBus.eventHandlers.get(eventType.name);
        if (!currentEventHandlers) {
            currentEventHandlers = [];
            this.eventHandlers.set(eventType.name, currentEventHandlers);
        }
        currentEventHandlers.push(handler);

        return {
            unregister: (): void => {
                const handlerIndex = currentEventHandlers.indexOf(handler);
                if (handlerIndex !== -1) {
                    currentEventHandlers.splice(handlerIndex, 1);
                }
            }
        };
    }

    static emit(event: any): void {
        const handlers = EventBus.eventHandlers.get(event.constructor.name) || [];
        handlers.forEach(handler => handler(event));
    }
}
