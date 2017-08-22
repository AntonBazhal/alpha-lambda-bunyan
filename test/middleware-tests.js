'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const uuid = require('uuid');

const middleware = require('../lib/middleware');
const serializers = require('../lib/serializers');

chai.use(chaiSubset);
const expect = chai.expect;

describe('middleware', function() {

  beforeEach(function() {
    this.testContext = {
      awsRequestId: uuid.v4(),
      functionName: 'testFunction',
      functionVersion: '$LATEST'
    };
  });

  it('should add log property to context', function() {
    expect(this.testContext).not.to.have.property('log');

    const fixture = middleware();

    return fixture({}, this.testContext, (err, newContext) => {
      expect(err).to.not.exist;
      expect(newContext)
        .to.have.property('log')
        .that.is.an.instanceof(bunyan);
    });
  });

  it('should add child property to context', function() {
    expect(this.testContext).not.to.have.property('log');

    const fixture = middleware();

    return fixture({}, this.testContext, (err, newContext) => {
      expect(err).to.not.exist;
      expect(newContext)
        .to.have.property('child')
        .that.is.a('function');
    });
  });

  it('should have default fields added to each log record', function() {
    const fixture = middleware();

    return fixture({}, this.testContext, (err, newContext) => {
      expect(newContext)
        .to.have.property('log')
        .that.containSubset({
          fields: {
            name: this.testContext.functionName,
            awsRequestId: this.testContext.awsRequestId,
            functionVersion: this.testContext.functionVersion
          }
        });
    });
  });

  it('should have default serializers set', function() {
    const fixture = middleware();

    return fixture({}, this.testContext, (err, newContext) => {
      expect(newContext)
        .to.have.property('log')
        .that.has.property('serializers')
        .that.deep.equals({
          err: middleware.serializers.error,
          error: middleware.serializers.error,
          context: middleware.serializers.context
        });
    });
  });

  it('should have default log level overridden by options.level', function() {
    const fixture = middleware({ level: 'debug' });

    return fixture({}, this.testContext, (err, newContext) => {
      expect(newContext)
        .to.have.property('log')
        .that.has.property('_level', 20);
    });
  });

  it('should have default serializers overridden by options.serializers', function() {
    const newContextSerializer = () => 'newContextSerializer';
    const customSerializer = () => 'customSerializer';
    const fixture = middleware({
      serializers: {
        context: newContextSerializer,
        custom: customSerializer
      }
    });

    return fixture({}, this.testContext, (err, newContext) => {
      expect(newContext)
        .to.have.property('log')
        .that.has.property('serializers')
        .that.deep.equals({
          err: middleware.serializers.error,
          error: middleware.serializers.error,
          context: newContextSerializer,
          custom: customSerializer
        });
    });
  });

  it('should export extend method', function() {
    expect(middleware)
      .to.have.property('extend')
      .that.is.a('function');
  });

  it('should export serializers', function() {
    expect(middleware)
      .to.have.property('serializers')
      .that.deep.equals(serializers);
  });

  describe('#child', function() {
    it('should create child context', function() {
      const testField = 'testField';
      const fixture = middleware();

      return fixture({}, this.testContext, (err, newContext) => {
        const newContextClone = _.cloneDeep(newContext);
        const childContext = newContext.child({ testField });
        expect(newContext).deep.equals(newContextClone, 'context should not be mutated');
        expect(childContext).not.to.deep.equal(newContext);
        expect(childContext).to.containSubset({
          log: {
            fields: { testField }
          }
        });
      });
    });
  });
});
