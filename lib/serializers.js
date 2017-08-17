'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');

module.exports = {
  context(ctx) {
    return _.omit(ctx, ['log', 'child']);
  },

  error(err) {
    const bunyanError = bunyan.stdSerializers.err(err);
    if (!_.isObject(err) || !_.isObject(bunyanError)) {
      return bunyanError;
    }

    return _.assign({}, err, bunyanError);
  }
};
