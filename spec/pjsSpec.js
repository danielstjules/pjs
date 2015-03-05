var expect     = require('expect.js');
var pjs        = require('../lib/pjs.js');
var helpers    = require('./helpers');
var testStream = helpers.testStream;

describe('pjs', function() {
  var lines = ['a', 'b', 'foo', 'bar'];

  describe('filter', function() {
    it('does not modify the array if the exp is always true', function(done) {
      var filter = pjs.filter('true');

      testStream(lines, filter, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(lines);
        done();
      });
    });

    it('binds any string prototype keys to the line in question', function(done) {
      var filter = pjs.filter('length === 3');

      testStream(lines, filter, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['foo', 'bar']);
        done();
      });
    });

    it("passes the line's index, i, to the function", function(done) {
      var filter = pjs.filter('i % 2 === 0');

      testStream(lines, filter, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['a', 'foo']);
        done();
      });
    });

    it('outputs newline delimited results if outputString is true', function(done) {
      var filter = pjs.filter('3 !== length', true);

      testStream(lines, filter, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(["a\n", "b\n"]);
        done();
      });
    });
  });

  describe('map', function() {
    it('modifies the array with the given expression', function(done) {
      var map = pjs.map('"i"');

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['i', 'i', 'i', 'i']);
        done();
      });
    });

    it('binds any string prototype keys to the line in question', function(done) {
      var map = pjs.map('toUpperCase()');

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['A', 'B', 'FOO', 'BAR']);
        done();
      });
    });

    it("passes the line's index, i, to the function", function(done) {
      var map = pjs.map('i');

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['0', '1', '2', '3']);
        done();
      });
    });

    it('outputs newline delimited results if outputString is true', function(done) {
      var map = pjs.map('toLowerCase()', true);

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(["a\n", "b\n", "foo\n", "bar\n"]);
        done();
      });
    });

    it('can reference the line as "$"', function(done) {
      var map = pjs.map('$.charAt(0)', false);

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['a', 'b', 'f', 'b']);
        done();
      });
    });

    it('encodes null values as an object to avoid ending the stream', function(done) {
      var map = pjs.map('null', false, true);

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql([
          {value: null},
          {value: null},
          {value: null},
          {value: null}
        ]);
        done();
      });
    });

    it('treats input as expressions, accepting object literals', function(done) {
      var map = pjs.map('{length: length}');

      testStream(lines, map, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql([
          {length: 1},
          {length: 1},
          {length: 3},
          {length: 3}
        ]);
        done();
      });
    });
  });

  describe('reduce', function() {
    it('returns the length when passed as the expression', function(done) {
      var reduce = pjs.reduce('length');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(3);
        done();
      });
    });

    it('returns the min when passed as the expression', function(done) {
      var reduce = pjs.reduce('min');

      testStream([2, 4, 8], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(2);
        done();
      });
    });

    it('returns the max when passed as the expression', function(done) {
      var reduce = pjs.reduce('max');

      testStream([2, 4, 8], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(8);
        done();
      });
    });

    it('returns the sum when passed as the expression', function(done) {
      var reduce = pjs.reduce('sum');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(6);
        done();
      });
    });

    it('returns the avg when passed as the expression', function(done) {
      var reduce = pjs.reduce('avg');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(2);
        done();
      });
    });

    it('returns the concatenated string when passed "concat"', function(done) {
      var reduce = pjs.reduce('concat');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql('123');
        done();
      });
    });

    it('accepts a custom expression, passing prev and curr', function(done) {
      var reduce = pjs.reduce('prev + curr');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(6);
        done();
      });
    });

    it('accepts a custom expression, also passing i and array', function(done) {
      var reduce = pjs.reduce('3 * array[i]');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql(9);
        done();
      });
    });

    it('encodes null values as an object to avoid ending the stream', function(done) {
      var reduce = pjs.reduce('null');

      testStream([1, 2, 3], reduce, {end: false}, function(err, res) {
        expect(err).to.be(null);
        expect(res[0]).to.eql({value: null});
        done();
      });
    });
  });

  describe('ignore', function() {
    it('ignores the last empty line resulting from split', function(done) {
      var ignore = pjs.ignore();

      testStream(['a', '', 'c', ''], ignore, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['a', '', 'c']);
        done();
      });
    });

    it('ignores all empty lines when ignoreEmpty is true', function(done) {
      var ignore = pjs.ignore(true);

      testStream(['a', '', 'c', ''], ignore, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['a', 'c']);
        done();
      });
    });
  });

  describe('json', function() {
    it('streams a single object when streamArray is false', function(done) {
      var json = pjs.json();

      testStream([{test: 'value'}], json, {}, function(err, res) {
        expect(err).to.be(null);
        expect(res).to.eql(['{"test":"value"}']);
        done();
      });
    });

    it('streams a string json array when streamArray is true', function(done) {
      var array = [{test: 'object1'}, {test: 'object2'}];
      var json = pjs.json(true);

      testStream(array, json, {}, function(err, res) {
        res = res.map(function(buffer) {
          return buffer.toString();
        });

        expect(err).to.be(null);
        expect(res).to.eql([
          '[\n',
          '{"test":"object1"}',
          ',\n',
          '{"test":"object2"}',
          '\n]\n'
        ]);
        done();
      });
    });
  });
});
