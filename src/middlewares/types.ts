import { Context } from 'aws-lambda';
import { Logger } from 'cazoo-logger';
import { Trace } from '@cazoo/telemetry';

export interface CustomContext extends Context {
    logger: Logger;
    trace: Trace | null;
}
