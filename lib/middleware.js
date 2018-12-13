'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');

const serializers = require('./serializers');

function child(fields) {
  const refProps = this._refProps;
  const newContext = _.cloneDeepWith(this, (val, key) => {
    return _.includes(refProps, key)
      ? val
      : undefined;
  });

  const log = this.log.child(fields);

  return _.assign(newContext, { log });
}

function extend(context, options) {
  options = options || {}; // eslint-disable-line no-param-reassign

  const _refProps = options.refProps
    ? [].concat(options.refProps)
    : [];

  const log = bunyan.createLogger({
    name: context.functionName,
    level: options.level || process.env.LOG_LEVEL || bunyan.INFO,
    awsRequestId: context.awsRequestId,
    functionVersion: context.functionVersion,
    serializers: _.assign({
      err: serializers.error,
      error: serializers.error,
      context: serializers.context
    }, options.serializers)
  });

  return _.assign(context, { log, child, _refProps });
}

module.exports = function(options) {
  return function(event, context, next) {
    return next(null, extend(context, options));
  };
};

module.exports.extend = extend;
module.exports.serializers = serializers;
