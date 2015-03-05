var expect      = require('expect.js');
var utils       = require('../lib/utils.js');
var _nullObject = utils._nullObject;

describe('utils', function() {
  describe('length', function() {
    it('returns the length of an array', function() {
      var result = utils.length([2, 4, 8]);
      expect(result).to.be(3);
    });
  });

  describe('min', function() {
    it('returns the min value in an array', function() {
      var result = utils.min([2, 4, 8]);
      expect(result).to.be(2);
    });

    it('converts a null object to null', function() {
      var result = utils.min([_nullObject, 1, 2]);
      expect(result).to.be(0);
    });
  });

  describe('max', function() {
    it('returns the max value in an array', function() {
      var result = utils.max([2, 4, 8]);
      expect(result).to.be(8);
    });

    it('converts a null object to null', function() {
      var result = utils.max([-2, _nullObject, -1]);
      expect(result).to.be(0);
    });
  });

  describe('sum', function() {
    it('calculates the sum of the elements in an array', function() {
      var result = utils.sum([1, 2, 3, 4]);
      expect(result).to.be(10);
    });

    it('casts values to numbers', function() {
      var result = utils.sum([true, true, '2.5']);
      expect(result).to.be(4.5);
    });

    it('converts a null object to null', function() {
      var result = utils.sum([2, _nullObject, -1]);
      expect(result).to.be(1);
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

    it('converts a null object to null', function() {
      var result = utils.avg([2, 4, _nullObject]);
      expect(result).to.be(2);
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

    it('converts a null object to null', function() {
      var result = utils.concat(['foo', 'bar', _nullObject]);
      expect(result).to.be('foobarnull');
    });
  });

  describe('getBoundExpression', function() {
    it('prepends identifiers that are keys in String.prototype by the var', function() {
      var result = utils.getBoundExpression('trim()', '$');
      expect(result).to.be('$.trim()');
    });

    it('correctly attributes identifiers given leading whitespace', function() {
      var result = utils.getBoundExpression('  trim()', '$');
      expect(result).to.be('  $.trim()');
    });

    it('does not modify keys in object literals', function() {
      var result = utils.getBoundExpression('{length: length}', '$');
      expect(result).to.be('{length: $.length}');
    });

    it('ignores identifiers in which a prototype key is a substring', function() {
      var identifiers = ['asubstr', 'substra', 'asubstra', '_substr',
        'substr_', '_substr_', 'substr123', 'x.substr'];

      identifiers.forEach(function(str) {
        expect(utils.getBoundExpression(str, '$')).to.be(str);
      });
    });
  });
});
