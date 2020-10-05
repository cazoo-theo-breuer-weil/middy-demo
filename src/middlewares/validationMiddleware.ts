import middy from '@middy/core';

import { CustomContext } from './types';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';

export class ValidationMiddleware<T extends AnyEvent, C>
    implements middy.MiddlewareObject<T, C, CustomContext> {
    private readonly validate: (event: unknown) => event is T;

    public constructor(validate: (event: unknown) => event is T) {
        this.validate = validate;
    }

    public before: middy.MiddlewareFunction<T, C, CustomContext> = (
        { context, event },
        next,
    ) => {
        const processTrace = context.trace
            ? context.trace.startChild('validation')
            : null;

        try {
            if (!this.validate(event)) {
                context.logger.error('event failed validation');
                throw new Error('invalid');
            }

            next();
        } finally {
            processTrace?.end();
        }
    };
}
