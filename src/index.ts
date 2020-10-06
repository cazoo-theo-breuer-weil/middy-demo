import { empty } from 'cazoo-logger';
import { default as middy } from '@middy/core';

import {
    CustomContext,
    injectBaseCustomContext,
    LoggerMiddleware,
    RedeliveryMiddleware,
    TraceMiddleware,
    ValidationMiddleware,
} from './middlewares';

import { someBusinessLogic } from './handler';
import { ExampleEvent, validateEvent } from './validation';

type Handler = (e: ExampleEvent, context: CustomContext) => Promise<void>;
const buildLogger = () => empty();

export const handler = middy<Handler, CustomContext>(someBusinessLogic)
    .before(injectBaseCustomContext)
    .use(new TraceMiddleware('example'))
    .use(new LoggerMiddleware(buildLogger))
    .use(new RedeliveryMiddleware())
    .use(new ValidationMiddleware(validateEvent));
