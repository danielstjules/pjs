/**
 * The pjs library module exports five functions: filter, map, reduce,
 * ignore and json.
 */

var stream        = require('stream');
var Stringify     = require('streaming-json-stringify');
var StringDecoder = require('string_decoder').StringDecoder;
var utils         = require('./utils');

/**
 * Accepts an expression to evaluate, and two booleans. The first indicates
 * whether or not to cast output to a string, while the second requires that
 * "$" be used to refer to the current element. Given these arguments, a stream
 * is returned, behaving much like array.filter(). It evaluates the expression
 * for each piped value, streaming those which resulted in a truthy expression.
 *
 * @param  {string}    expression   The expression to evaluate
 * @param  {bool}      explicit     Whether or not to require "$"
 * @param  {bool}      outputString Whether or not to output strings
 * returns {Transform} A transform stream in objectMode
 */
exports.filter = function(expression, outputString, explicit) {
  var exp = (explicit) ? expression : utils.getBoundExpression(expression, '$');
  var include = function($) {
    return eval(exp);
  };

  var filterStream = new stream.Transform({objectMode: true});
  closeOnEnd(filterStream);

  filterStream._transform = function(chunk, encoding, fn) {
    if (!include(chunk)) return fn();
    if (outputString) chunk = String(chunk) + "\n";

    this.push(chunk);
    return fn();
  };

  return filterStream;
};

/**
 * Accepts an expression to evaluate, and two booleans. The first indicates
 * whether or not to cast output to a string, while the second requires that
 * "$" be used to refer to the current element. Given these arguments, a stream
 * is returned, behaving much like array.map(). It streams the modified values
 * as a result of the evaluated expression.
 *
 * @param  {string}    expression   The expression to evaluate
 * @param  {bool}      explicit     Whether or not to require "$"
 * @param  {bool}      outputString Whether or not to output strings
 * returns {Transform} A transform stream in objectMode
 */
exports.map = function(expression, outputString, explicit) {
  var exp = (explicit) ? expression : utils.getBoundExpression(expression, '$');

  var update;
  if (outputString) {
    update = function($) {
      return String(eval(exp)) + "\n";
    };
  } else {
    update = function($) {
      return eval(exp);
    };
  }

  var mapStream = new stream.Transform({objectMode: true});
  closeOnEnd(mapStream);

  mapStream._transform = function(chunk, encoding, fn) {
    this.push(update(chunk));
    return fn();
  };

  return mapStream;
};

/**
 * Accepts an array and an expression to evaluate. It invokes a built-in
 * function if expression is one of: length, min, max, sum, avg or concat.
 * Otherwise, it evaluates the passed expression, passing it as the callback
 * to reduce.
 *
 * @param  {*[]}    array      An array to reduce
 * @param  {string} expression The expression to evaluate
 * returns {*}      A reduced value
 */
exports.reduce = function(expression, outputString) {
  var accumulator = [];

  var performReduce = function() {
    var builtin = ['length', 'min', 'max', 'sum', 'avg', 'concat'];
    if (builtin.indexOf(expression) !== -1) {
      return utils[expression](accumulator);
    }

    return accumulator.reduce(function(prev, curr, i, array) {
      return eval(expression);
    });
  };

  var collectStream = new stream.Transform({objectMode: true});
  collectStream._transform = function(chunk, encoding, fn) {
    accumulator.push(chunk);
    return fn();
  };

  collectStream.on('pipe', function(src) {
    src.on('end', function() {
      var result = performReduce();
      if (outputString) result = String(result) + "\n";

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
  var emptyFlag;

  var ignoreStream = new stream.Transform({objectMode: true});
  closeOnEnd(ignoreStream);

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
  // Stream array members
  if (streamArray) {
    var stringify = new Stringify();
    stringify.seperator = new Buffer(',\n', 'utf8');
    return stringify;
  }

  // Stringify entire object
  var jsonStream = new stream.Transform({objectMode: true});
  jsonStream._transform = function(chunk, encoding, fn) {
    this.push(JSON.stringify(chunk));
    return fn();
  };

  return jsonStream;
};

/**
 * Given a stream that was piped to with end set to false, installs the
 * necessary handlers to close the pipe on source end.
 *
 * @param {Stream} The stream to modify
 */
function closeOnEnd(stream) {
  stream.on('pipe', function(src) {
    src.on('end', function() {
      stream.end();
    });
  });
}
