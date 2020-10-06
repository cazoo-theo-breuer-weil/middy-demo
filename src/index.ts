import { default as middy } from '@middy/core';

import { buildLogger } from './logger';
import { someBusinessLogic } from './handler';
import { ExampleEvent, validateEvent } from './validation';

import {
    CustomContext,
    injectBaseCustomContext,
    LoggerMiddleware,
    RedeliveryMiddleware,
    TraceMiddleware,
    ValidationMiddleware,
} from './middlewares';

type Handler = (e: ExampleEvent, context: CustomContext) => Promise<void>;

export const handler = middy<Handler, CustomContext>(someBusinessLogic)
    .before(injectBaseCustomContext)
    .use(new TraceMiddleware('example'))
    .use(new LoggerMiddleware(buildLogger))
    .use(new RedeliveryMiddleware())
    .use(new ValidationMiddleware(validateEvent));
