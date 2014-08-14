/**
 * The pjs library module exports three functions: filter, map and reduce.
 */

var stream        = require('stream');
var Stringify     = require('streaming-json-stringify');
var StringDecoder = require('string_decoder').StringDecoder;
var utils         = require('./utils');

/**
 * Accepts an array, an expression to evaluate, and a boolean indicating
 * whether or not to explicitly require that "$" be used to refer to the
 * current element. Given these arguments, reduce is invoked, using the
 * evaluated expression as the return statement for the callback. Any values
 * that resulted in the expression evaluating as true are included in the
 * returned array.
 *
 * @param  {string} expression   The expression to evaluate
 * @param  {bool}   explicit     Whether or not to require "$"
 * @param  {bool}   outputString Whether or not to output strings
 * returns {*[]}    A filtered array
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
    fn();
  };

  return filterStream;
};

/**
 * Accepts an array, an expression to evaluate, and a boolean indicating
 * whether or not to explicitly require that "$" be used to refer to the
 * current element. Given these arguments, map is invoked, using the evaluated
 * expression as the return statement for the callback. Returns an array
 * containing the modified values.
 *
 * @param  {string[]} lines      A string array to map
 * @param  {string}   expression The expression to evaluate
 * @param  {bool}     explicit   Whether or not to require "$"
 * returns {*[]}      A modified array
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
    fn();
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
    fn();
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
 * Returns a stream that can stringify any piped objects or arrays. If an
 * array is to be piped, an instance of json-array-stream is returned
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
    fn();
  };

  return jsonStream;
};

function closeOnEnd(stream) {
  stream.on('pipe', function(src) {
    src.on('end', function() {
      stream.end();
    });
  });
}
