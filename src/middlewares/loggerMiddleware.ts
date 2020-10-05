import { Context } from 'aws-lambda';
import { Logger } from 'cazoo-logger';
import { AnyEvent } from '@cazoo/telemetry/dist/events/anyEvent';
import { default as middy } from '@middy/core';

import { CustomContext } from './types';

type LoggerConstructor = (event: AnyEvent, context: Context) => Logger;

export class LoggerMiddleware<T extends AnyEvent, R>
    implements middy.MiddlewareObject<T, R, CustomContext> {
    private readonly loggerConstructor: LoggerConstructor;

    public constructor(loggerConstructor: LoggerConstructor) {
        this.loggerConstructor = loggerConstructor;
    }

    public before: middy.MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        const logger = this.loggerConstructor(
            handler.event,
            handler.context,
        );

        logger.withData({ event: handler.event }).info('invoked');
        handler.context.logger = logger;
        next();
    };

    public after: middy.MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        handler.context.logger.info('successfully handled event');
        next();
    };

    public onError: middy.MiddlewareFunction<T, R, CustomContext> = (
        handler,
        next,
    ) => {
        handler.context.logger.recordError(
            handler.error,
            'encountered unhandled error',
        );

        next(handler.error);
    };
}
