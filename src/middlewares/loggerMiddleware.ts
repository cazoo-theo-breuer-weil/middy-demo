import { Context } from 'aws-lambda';
import { Logger } from 'cazoo-logger';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';
import { MiddlewareObject, MiddlewareFunction } from 'middy';

import { CustomContext } from './types';

type LoggerConstructor = (event: AnyEvent, context: Context) => Logger;

export class LoggerMiddleware<T extends AnyEvent, R = void>
    implements MiddlewareObject<T, R, CustomContext> {
    private readonly loggerConstructor: LoggerConstructor;

    public constructor(loggerConstructor: LoggerConstructor) {
        this.loggerConstructor = loggerConstructor;
    }

    public before: MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        const { event, context } = handler;
        const logger = this.loggerConstructor(event, context);
        logger.withData({ event }).info('invoked');

        handler.context = {
            ...context,
            logger,
        };

        next();
    };

    public after: MiddlewareFunction<T, R, CustomContext> = (
        { context: { logger } },
        next,
    ) => {
        logger.info('successfully handled event');
        next();
    };

    public onError: MiddlewareFunction<T, R, CustomContext> = (
        { context: { logger }, error },
        next,
    ) => {
        logger.recordError(error, 'encountered unhandled error');
        next(error);
    };
}
