import * as t from 'io-ts';
import { ScheduledEvent } from 'aws-lambda';

export const ExampleEventPayload = t.interface({
    a: t.string,
    b: t.number,
});

export type ExampleEventPayload = t.TypeOf<typeof ExampleEventPayload>;
export type ExampleEvent = ScheduledEvent<ExampleEventPayload>;

export const isScheduledEvent = (event: any): event is ScheduledEvent => {
    return 'detail' in event;
};

export const validateEvent = (event: unknown): event is ExampleEvent => {
    return (
        isScheduledEvent(event) && ExampleEventPayload.is(event.detail)
    );
};
