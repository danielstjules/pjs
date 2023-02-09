/**
 * The pjs library module exports five functions: filter, map, reduce,
 * ignore and json.
 */

var stream        = require('stream');
var Stringify     = require('streaming-json-stringify');
var StringDecoder = require('string_decoder').StringDecoder;
var inspect       = require('util').inspect;
var utils         = require('./utils');
var _nullObject   = utils._nullObject;
var _             = require('lodash');
var R             = require('ramda');

/**
 * Accepts an expression to evaluate, and two booleans. The first indicates
 * whether or not to cast output to a string, while the second requires that
 * "$" be used to refer to the current element. Given these arguments, a stream
 * is returned, behaving much like array.filter(). The expression is passed
 * two arguments: $, the line, and i, its index. It evaluates the expression
 * for each piped value, streaming those which resulted in a truthy expression.
 *
 * @param  {string}    expression   The expression to evaluate
 * @param  {bool}      outputString Whether or not to output strings
 * returns {Transform} A transform stream in objectMode
 */
exports.filter = function(expression, outputString) {
  var i, include, filterStream;

  i = 0;
  include = function($, i) {
    with ($) {
      var $$ = _.chain($);
      var _result = eval(expression);
      _result = unpackIfLodash(_result);
      return _result;
    }
  };

  filterStream = new stream.Transform({objectMode: true});
  filterStream._transform = function(chunk, encoding, fn) {
    if (!include(chunk, i++)) return fn();
    if (outputString) chunk = String(chunk) + '\n';

    this.push(chunk);
    return fn();
  };

  return filterStream;
};

/**
 * Accepts an expression to evaluate, and two booleans. The first indicates
 * whether or not to cast output to a string, while the second requires that
 * "$" be used to refer to the current element. Given these arguments, a stream
 * is returned, behaving much like array.map(). The expression is passed
 * two arguments: $, the line, and i, its index. It streams the modified values
 * as a result of the evaluated expression.
 *
 * @param  {string}    expression   The expression to evaluate
 * @param  {bool}      outputString Whether or not to output strings
 * returns {Transform} A transform stream in objectMode
 */
exports.map = function(expression, outputString) {
  var i, update, mapStream;

  i = 0;
  update = function($, i) {
    with ($) {
      var $$ = _.chain($);
      var _result = eval('(' + expression + ')');
      _result = unpackIfLodash(_result);
      return (_result === null) ? _nullObject : _result;
    }
  };

  if (outputString) {
    update = function($, i) {
      with ($) {
        var $$ = _.chain($);
        var res = eval('(' + expression + ')');
        res = unpackIfLodash(res);
        if (typeof res === 'string') return res + '\n';
        return inspect(res) + '\n';
      }
    };
  }

  mapStream = new stream.Transform({objectMode: true});
  mapStream._transform = function(chunk, encoding, fn) {
    this.push(update(chunk, i++));
    return fn();
  };

  return mapStream;
};

/**
 * Accepts an array and an expression to evaluate. It invokes a built-in
 * function if expression is one of: length, min, max, sum, avg or concat.
 * Otherwise, it evaluates the passed expression, passing it as the callback
 * to reduce. Must be piped to with end set to false.
 *
 * @param  {*[]}    array      An array to reduce
 * @param  {string} expression The expression to evaluate
 * returns {*}      A reduced value
 */
exports.reduce = function(expression, outputString) {
  var accumulator, performReduce, collectStream;

  accumulator = [];
  performReduce = function() {
    var builtin = ['length', 'min', 'max', 'sum', 'avg', 'concat'];
    if (builtin.indexOf(expression) !== -1) {
      return utils[expression](accumulator);
    }

    return accumulator.reduce(function(prev, curr, i, array) {
      if (prev === _nullObject) {
        prev = null;
      }
      if (curr === _nullObject) {
        curr = null;
      }

      return eval(expression);
    });
  };

  collectStream = new stream.Transform({objectMode: true});
  collectStream._transform = function(chunk, encoding, fn) {
    accumulator.push(chunk);
    return fn();
  };

  collectStream.on('pipe', function(src) {
    src.on('end', function() {
      var result = performReduce();
      if (outputString) {
        result = String(result) + '\n';
      } else if (result === null) {
        result = _nullObject;
      }

      collectStream.push(result);
      collectStream.end();
    });
  });

  return collectStream;
};

/**
 * Returns a Transform stream that ignores the last empty line in a file
 * created by splitting on newlines. If ignoreEmpty is true, all empty lines
 * are ignored.
 *
 * @param  {bool}      ignoreEmpty Whether or not to ignore all empty lines
 * @return {Transform} A transform stream in object mode
 */
exports.ignore = function(ignoreEmpty) {
  var emptyFlag, ignoreStream;

  ignoreStream = new stream.Transform({objectMode: true});
  ignoreStream._transform = function(chunk, encoding, fn) {
    if (emptyFlag) {
      this.push('');
      emptyFlag = false;
    }

    if (chunk !== '') {
      this.push(chunk);
    } else if (!ignoreEmpty) {
      emptyFlag = true;
    }

    return fn();
  };

  return ignoreStream;
};

/**
 * Returns a Transform stream that can stringify any piped objects or arrays.
 * If an array is to be piped, an instance of json-array-stream is returned
 * which will stringify members individually. Otherwise, a transform stream is
 * returned that will buffer the full object before applying JSON.stringify.
 *
 * @param  {bool}      streamArray Whether or not an array will be streamed
 * @return {Transform} A transform stream in object mode
 */
exports.json = function(streamArray) {
  var stringify, jsonStream, i;

  // Stream array members
  if (streamArray) {
    return getStringifyStream();
  }

  // Stringify entire object
  jsonStream = new stream.Transform({objectMode: true});
  jsonStream._transform = function(chunk, encoding, fn) {
    if (chunk === _nullObject) {
      chunk = null;
    }

    this.push(JSON.stringify(chunk));
    return fn();
  };

  return jsonStream;
};

/**
 * Returns an instance of json-array-stream, or Stringify. The instance has
 * been updated to handle the ",\n" as a delimiter, as well as convert
 * _nullObject to null, prior to calling JSON.stringify.
 *
 * @returns {Stringify} The stringify stream
 */
function getStringifyStream() {
  stringify = new Stringify();
  stringify.seperator = Buffer.from(',\n', 'utf8');

  // Overwrite default _transform to convert _nullObject
  stringify._transform = function(doc, enc, fn) {
    if (this.destroyed) return;

    if (this.started) {
      this.push(this.seperator);
    } else {
      this.push(this.open);
      this.started = true;
    }

    if (doc === _nullObject) {
      doc = null;
    }

    try {
      doc = JSON.stringify(doc, this.replacer, this.space);
    } catch (err) {
      return fn(err);
    }

    this.push(Buffer.from(doc, 'utf8'));
    fn();
  };

  return stringify;
}

/**
 * If given a lodash object, the object's value is returned. Otherwise the
 * original argument is returned.
 *
 * @param   {*} obj
 * @returns {*}
 */
function unpackIfLodash(obj) {
  return (obj && obj.constructor.name === 'LodashWrapper') ? obj.value() : obj;
}
