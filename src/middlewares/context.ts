import { Context } from 'aws-lambda';
import { empty } from 'cazoo-logger';
import { MiddlewareFunction } from 'middy';

import { CustomContext } from './types';

export const createCustomContext = (context: Context): CustomContext => {
    return {
        ...context,
        logger: empty(),
        trace: null,
    };
};

export const injectBaseCustomContext: MiddlewareFunction<
    any,
    any,
    CustomContext
> = (handler, next) => {
    handler.context = createCustomContext(handler.context);
    next();
};
