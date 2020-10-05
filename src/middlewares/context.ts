import { Context } from 'aws-lambda';
import { empty } from 'cazoo-logger';
import middy from '@middy/core';

import { CustomContext } from './types';

export const createCustomContext = (context: Context): CustomContext => {
    return {
        ...context,
        logger: empty(),
        trace: null,
    };
};

export const injectBaseCustomContext: middy.MiddlewareFunction<
    any,
    any,
    CustomContext
> = (handler, next) => {
    handler.context = createCustomContext(handler.context);
    next();
};
