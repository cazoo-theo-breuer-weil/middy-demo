import { empty } from 'cazoo-logger';
import { default as middy } from '@middy/core';

import {
    injectBaseCustomContext,
    LoggerMiddleware,
    RedeliveryMiddleware,
    TraceMiddleware,
    ValidationMiddleware,
} from './middlewares';

import { someBusinessLogic } from './handler';
import { ExampleEvent, validateEvent } from './validation';

export const handler = middy(someBusinessLogic)
    .before(injectBaseCustomContext)
    .use(new TraceMiddleware<ExampleEvent, void>('example'))
    .use(new LoggerMiddleware(() => empty()))
    .use(new RedeliveryMiddleware())
    .use(new ValidationMiddleware(validateEvent));
