import { ExampleEvent } from './validation';
import { CustomContext } from './middlewares';

export const someBusinessLogic = async (
    event: ExampleEvent,
    context: CustomContext,
): Promise<void> => {
    context.trace && context.trace.startChild('innerTrace').end();

    return;
};
