import { Telemetry } from '@cazoo/telemetry';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';
import { MiddlewareFunction, MiddlewareObject } from 'middy';

import { CustomContext } from './types';

export class TraceMiddleware<T extends AnyEvent, R = void>
    implements MiddlewareObject<T, R, CustomContext> {
    private readonly rootTraceName: string;

    public constructor(rootTraceName: string) {
        this.rootTraceName = rootTraceName;
    }

    public before: MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        const { event, context } = handler;

        handler.context = {
            ...context,
            trace: Telemetry.startWithContext(
                this.rootTraceName,
                event,
                context,
            ),
        };

        next();
    };

    public after: MiddlewareFunction<T, R, CustomContext> = async (
        { context: { trace } },
        next,
    ) => {
        trace && trace.end();
        next();
    };

    public onError: MiddlewareFunction<T, R, CustomContext> = (
        { context: { trace }, error },
        next,
    ) => {
        trace && trace.endWithError(error);
        next(error);
    };
}
