var expect = require('expect.js');
var utils  = require('../lib/utils.js');

describe('utils', function() {
  describe('sum', function() {
    it('calculates the sum of the elements in an array', function() {
      var result = utils.sum([1, 2, 3, 4]);
      expect(result).to.be(10);
    });

    it('casts values to numbers', function() {
      var result = utils.sum([true, true, '2.5']);
      expect(result).to.be(4.5);
    });
  });

  describe('avg', function() {
    it('calculates the avg of the elements in an array', function() {
      var result = utils.avg([1, 2, 3, 4]);
      expect(result).to.be(2.5);
    });

    it('casts values to numbers', function() {
      var result = utils.avg([true, true, '1.5', '2.5']);
      expect(result).to.be(1.5);
    });
  });

  describe('concat', function() {
    it('concatenates the elements in an array', function() {
      var result = utils.concat(['a', 'b', 'c']);
      expect(result).to.be('abc');
    });

    it('casts values to strings', function() {
      var result = utils.concat(['foo', true, 0]);
      expect(result).to.be('footrue0');
    });
  });
});
