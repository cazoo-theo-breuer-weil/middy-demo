import { default as middy } from '@middy/core';
import { Telemetry } from '@cazoo/telemetry';

import { CustomContext } from './types';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';

export class TraceMiddleware<T extends AnyEvent, R = void>
    implements middy.MiddlewareObject<T, R, CustomContext> {
    private readonly rootTraceName: string;

    public constructor(rootTraceName: string) {
        this.rootTraceName = rootTraceName;
    }

    public before: middy.MiddlewareFunction<T, R, CustomContext> = (
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

    public after: middy.MiddlewareFunction<T, R, CustomContext> = async (
        { context: { trace } },
        next,
    ) => {
        trace && trace.end();
        next();
    };

    public onError: middy.MiddlewareFunction<T, R, CustomContext> = (
        { context: { trace }, error },
        next,
    ) => {
        trace && trace.endWithError(error);
        next(error);
    };
}
