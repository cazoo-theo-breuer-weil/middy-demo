# What is this?
This repository demonstrates a new way of laying out lambda functions.

## Motivation
Lambda functions can often involve writing a lot of boilerplate code. This
sucks for a few reasons:
* we have to write boilerplate code
* we have to write the same tests over and again
* we end up with slightly different logging patterns
* we can forget to do important things (like adding service names to our loggers)

We currently use the two lambda handler classes to solve this problem
(`NonHttpLambdaHandler` and `HttpLambdaHandler`). These have been reasonably
successful but still suffer from a few problems:
* inflexible: they are essentially monolithic blocks of code that aren't very amenable
to extension
* totally shared: since nearly all of our lambdas use one of the two classes, we need
to be very mindful when making changes
* opinionated: they enforce the mapper-handler pattern, which doesn't always make sense

This repository demonstrates an approach that tries to retain the benefits of our current
solution while avoiding some of its problems. The ideal solution would be:
* easily re-usable
* ergonomic for developers (i.e. not verbose)
* composable
* unopinionated

## Approach
This repository implements the middleware pattern using a library called Middy. The
overarching philosophy is that we break any boilerplate tasks into a series of
individual middlewares. Consumers are then free to re-use any of all of our boilerplate
while omitting or re-implementing the bits that don't suit them.

This repository demonstrates the following use cases:
* creating a logger and logging the standard invocation / completion messages
* creating a root trace (for Honeycomb) and starting it / ending it on function completion
* validating event payloads
* checking that an event has not been delivered twice (more speculative, not currently in use)

### Context and dependencies
This solution relies on adding any new dependencies (loggers, traces) to the AWS context
object. This is sub-optimal (particularly in TypeScript terms) but I feel that this is an
acceptable price for the other benefits that this approach brings.

### Error handling
Middy lets middlewares define an `onError` method that is invoked when the lambda function
errors. It invokes the error handlers in order - this is essentially an implementation of the
functional 'railroad' approach: each middleware either completes or is allowed to clean
up after itself in case of error.

So in this case:

```typescript
const handler = middy(someBusinessLogic)
    .use(middlewareA)
    .use(middlewareB)
    .use(middlewareC);
```

In a successful invocation, we would run the following in order:
*  `middlewareA.before`
*  `middlewareB.before`
*  `middlewareC.before`
*  `someBusinessLogic`
*  `middlewareC.after`
*  `middlewareB.after`
*  `middlewareA.after`

In a failed invocation, we would run the following in order:
*  `middlewareA.before`
*  `middlewareB.before`
*  `middlewareC.before`
*  `someBusinessLogic`
*  `middlewareC.onError`
*  `middlewareB.onError`
*  `middlewareA.onError`

Error handling runs for errors in middlewares as well as in the main handler.
We are free to choose whether to propagate the error to the outside or not,
which allows us to re-use the same middlwares across HTTP and non-HTTP use cases.
