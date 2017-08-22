'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');

const serializers = require('./serializers');

function child(fields) {
  const newContext = _.cloneDeep(this);
  const log = this.log.child(fields);

  return Object.assign(newContext, { log });
}

function extend(context, options) {
  options = options || {}; // eslint-disable-line no-param-reassign

  const newContext = _.cloneDeep(context);
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

  return _.assign(newContext, { log, child });
}

module.exports = function(options) {
  return function(event, context, next) {
    const newContext = extend(context, options);
    return next(null, newContext);
  };
};

module.exports.extend = extend;
module.exports.serializers = serializers;
