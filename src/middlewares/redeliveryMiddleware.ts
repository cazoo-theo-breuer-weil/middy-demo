import { ScheduledEvent } from 'aws-lambda';
import middy from '@middy/core';

import { CustomContext } from './types';

const isDuplicateEventID = async (id: string): Promise<boolean> => {
    return true;
};

export class RedeliveryMiddleware<T extends ScheduledEvent<unknown>, R>
    implements middy.MiddlewareObject<T, R, CustomContext> {
    public before: middy.MiddlewareFunction<T, R, CustomContext> = async (
        { event, callback, context },
        next,
    ) => {
        try {
            if (await isDuplicateEventID(event.id)) {
                context.logger.info('duplicate event, aborting');
                callback();
            }
        } catch (error) {
            context.logger.recordError(
                error,
                'could not check for event redelivery',
            );

            next();
        }
    };
}
