import * as t from 'io-ts';
import { ScheduledEvent } from 'aws-lambda';

export const ExampleEventPayload = t.interface({
    a: t.string,
    b: t.number,
});

export type ExampleEventPayload = t.TypeOf<typeof ExampleEventPayload>;
export type ExampleEvent = ScheduledEvent<ExampleEventPayload>;

export const validateEvent = (
    event: ScheduledEvent<unknown>,
): event is ExampleEvent => {
    return 'detail' in event && ExampleEventPayload.is(event.detail);
};
