# alpha-lambda-bunyan

[![Build Status][ci-image]][ci-url]
[![Coverage Status][coverage-image]][coverage-url]
[![NPM version][npm-image]][npm-url]
[![Dependencies Status][dependencies-image]][dependencies-url]
[![DevDependencies Status][devdependencies-image]][devdependencies-url]

Middleware for [alpha-lambda][alpha-lambda-url] that adds `log` and `child` methods to the [context][aws-context-url] object.

## Installation

```bash
$ npm install alpha-lambda-bunyan
```

## Usage

```js
const bunyan = require('alpha-lambda-bunyan');
const handler = require('alpha-lambda');

module.exports = handler()
  .use(bunyan({
    level: 'debug',
    serializers: {
      event(data) => { id: data.id }
    }
  }))
  .use((event, context) => {
    context.log({ event }, 'event received');

    const newContext = context.child({ event });
    return doSomething(newContext, event);
  });
```

### context.log

`context.log` is a [bunyan][bunyan-url] instance initialized with such properties:
- **name**: name of the [AWS Lambda][aws-lambda-url] function
- **level**: logging level taken from `options.level` or `LOG_LEVEL` environment variable; `info` by default (check [bunyan documentation][bunyan-url] for more information)
- **awsRequestId**: [AWS request ID][aws-context-url] associated with the request
- **functionVersion**: the [AWS Lambda][aws-lambda-url] function version that is executing
- **serializers**: custom serializers for `err` / `error` object (based on `bunyan.stdSerializers.err`, but custom error fields, if present, are included as well), and `context` object (to prevent `log` and `child` properties from being logged) (can be overridden/extended using `options.serializers`)

### context.child

`context.child` method provides a way to create child logger with additional bound fields to be included into log records. Please note, that original context is cloned, so it is not mutated. This method is based on [bunyan's log.child method][bunyan-log-child-url].

### extend(context, [options])

Library exports `extend` method, so it can be used not just like middleware.

```js
const bunyan = require('alpha-lambda-bunyan');
const handler = require('alpha-lambda');

module.exports = handler()
  .use((event, context) => {
    const newContext = bunyan.extend(context, { level: 'debug' });
    return doSomething(newContext, event);
  });
```

## Configuration

`alpha-lambda-bunyan` accepts an optional configuration object, where:
  - **[level]** - { String | Number } - [logging level][bunyan-levels-url]; when not set, logging level is taken from `LOG_LEVEL` environment variable (`info` by default)
  - **[serializers]** - { Object } - [custom serializers][bunyan-serializers-url] that override / extend existing ones
  - **[refProps]** - { String | String[] } - properties on the context that should be shallow copied and not deep copied when a child context is created

## License

The MIT License (MIT)

Copyright (c) 2017 Anton Bazhal

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[alpha-lambda-url]: https://www.npmjs.com/package/alpha-lambda
[aws-context-url]: http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
[aws-lambda-url]: https://aws.amazon.com/lambda/details/
[bunyan-levels-url]: https://www.npmjs.com/package/bunyan#levels
[bunyan-log-child-url]: https://www.npmjs.com/package/bunyan#logchild
[bunyan-serializers-url]: https://www.npmjs.com/package/bunyan#serializers
[bunyan-url]: https://www.npmjs.com/package/bunyan
[ci-image]: https://circleci.com/gh/AntonBazhal/alpha-lambda-bunyan.svg?style=shield&circle-token=85b132cd2d5da242b4a0c104bcc589f2cd015e8e
[ci-url]: https://circleci.com/gh/AntonBazhal/alpha-lambda-bunyan
[coverage-image]: https://coveralls.io/repos/github/AntonBazhal/alpha-lambda-bunyan/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/AntonBazhal/alpha-lambda-bunyan?branch=master
[dependencies-url]: https://david-dm.org/antonbazhal/alpha-lambda-bunyan
[dependencies-image]: https://david-dm.org/antonbazhal/alpha-lambda-bunyan/status.svg
[devdependencies-url]: https://david-dm.org/antonbazhal/alpha-lambda-bunyan?type=dev
[devdependencies-image]: https://david-dm.org/antonbazhal/alpha-lambda-bunyan/dev-status.svg
[npm-url]: https://www.npmjs.org/package/alpha-lambda-bunyan
[npm-image]: https://img.shields.io/npm/v/alpha-lambda-bunyan.svg
