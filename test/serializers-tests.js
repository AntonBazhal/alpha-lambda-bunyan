'use strict';

const expect = require('chai').expect;

const serializers = require('../lib/serializers');

describe('serializers', function() {
  describe('contextSerializer', function() {
    it('should omit "log" and "child" properties', function() {
      const initialContext = {
        log: 'log',
        child: 'child',
        meaningOfLife: 42
      };

      const sanitizedContext = serializers.context(initialContext);
      expect(sanitizedContext).to.deep.equal({
        meaningOfLife: initialContext.meaningOfLife
      });
    });
  });

  describe('errorSerializer', function() {
    it('should not do anything if error is not an object', function() {
      const testError = 'error';

      const sanitizedError = serializers.error(testError);
      expect(sanitizedError).to.deep.equal(testError);
    });

    it('should handle case when error is not an instance of the Error class', function() {
      const testError = {
        message: 'Winter is coming!',
        details: {
          temperature: -1
        }
      };

      const sanitizedError = serializers.error(testError);
      expect(sanitizedError).to.deep.equal(testError);
    });

    it('should handle case when error is an instance of the Error class without additional fields', function() {
      const testError = new Error('Winter is coming!');

      const sanitizedError = serializers.error(testError);
      expect(sanitizedError).to.have.property('message', testError.message);
      expect(sanitizedError).to.have.property('name');
      expect(sanitizedError).to.have.property('stack');
    });

    it('should handle case when error is an instance of the Error class with additional fields', function() {
      const testError = new Error('Winter is coming!');
      testError.details = {
        temperature: -1
      };

      const sanitizedError = serializers.error(testError);
      expect(sanitizedError).to.have.property('message', testError.message);
      expect(sanitizedError).to.have.property('name');
      expect(sanitizedError).to.have.property('stack');
      expect(sanitizedError)
        .to.have.property('details')
        .that.deep.equals(testError.details);
    });
  });
});
