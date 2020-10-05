import { default as middy } from '@middy/core';
import { Telemetry } from '@cazoo/telemetry';

import { CustomContext } from './types';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';

export class TraceMiddleware<T extends AnyEvent, R>
    implements middy.MiddlewareObject<T, R, CustomContext> {
    private readonly rootTraceName: string;

    public constructor(rootTraceName: string) {
        this.rootTraceName = rootTraceName;
    }

    public before: middy.MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        handler.context.trace = Telemetry.startWithContext(
            this.rootTraceName,
            handler.event,
            handler.context,
        );

        next();
    };

    public after: middy.MiddlewareFunction<T, R, CustomContext> = async (
        handler,
        next,
    ) => {
        handler.context.trace.end();
        next();
    };

    public onError: middy.MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        handler.context.trace.end();
        next(handler.error);
    };
}
