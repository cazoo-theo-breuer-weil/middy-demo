import { MiddlewareFunction, MiddlewareObject } from 'middy';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';

import { CustomContext } from './types';

export class ValidationMiddleware<T extends AnyEvent, R = void>
    implements MiddlewareObject<T, R, CustomContext> {
    private readonly validate: (event: unknown) => event is T;

    public constructor(validate: (event: unknown) => event is T) {
        this.validate = validate;
    }

    public before: MiddlewareFunction<T, R, CustomContext> = (
        { context: { logger, trace }, event },
        next,
    ) => {
        const processTrace = trace
            ? trace.startChild('validation')
            : null;

        try {
            if (!this.validate(event)) {
                logger.error('event failed validation');
                throw new Error('invalid');
            }

            next();
        } finally {
            processTrace?.end();
        }
    };
}
