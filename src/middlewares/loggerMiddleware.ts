import { Context } from 'aws-lambda';
import { Logger } from 'cazoo-logger';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';
import { default as middy } from '@middy/core';

import { CustomContext } from './types';

type LoggerConstructor = (event: AnyEvent, context: Context) => Logger;

export class LoggerMiddleware<T extends AnyEvent, R = void>
    implements middy.MiddlewareObject<T, R, CustomContext> {
    private readonly loggerConstructor: LoggerConstructor;

    public constructor(loggerConstructor: LoggerConstructor) {
        this.loggerConstructor = loggerConstructor;
    }

    public before: middy.MiddlewareFunction<T, R, CustomContext> = (
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

    public after: middy.MiddlewareFunction<T, R, CustomContext> = (
        { context: { logger } },
        next,
    ) => {
        logger.info('successfully handled event');
        next();
    };

    public onError: middy.MiddlewareFunction<T, R, CustomContext> = (
        { context: { logger }, error },
        next,
    ) => {
        logger.recordError(error, 'encountered unhandled error');
        next(error);
    };
}
