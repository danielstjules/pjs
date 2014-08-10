/**
 * The pjs library module exports three functions: filter, map and reduce.
 */

var utils = require('./utils');

/**
 * Accepts an array, an expression to evaluate, and a boolean indicating
 * whether or not to explicitly require that "$" be used to refer to the
 * current element. Given these arguments, reduce is invoked, using the
 * evaluated expression as the return statement for the callback. Any values
 * that resulted in the expression evaluating as true are included in the
 * returned array.
 *
 * @param  {string[]} lines      A string array to filter
 * @param  {string}   expression The expression to evaluate
 * @param  {bool}     explicit   Whether or not to require "$"
 * returns {*[]}      A filtered array
 */
exports.filter = runHigherOrder('filter');

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
exports.map = runHigherOrder('map');

/**
 * Accepts an array and an expression to evaluate. It invokes a built-in
 * function if expression is one of: sum, avg or concat. Otherwise, it
 * evaluates the passed expression, passing it as the callback to reduce.
 *
 * @param  {*[]}    array      An array to reduce
 * @param  {string} expression The expression to evaluate
 * returns {*}      A reduced value
 */
exports.reduce = function(array, expression) {
  var builtin = ['sum', 'avg', 'concat'];
  if (builtin.indexOf(expression) !== -1) {
    return utils[expression](array);
  }

  eval('var callback = ' + expression);

  return array.reduce(callback);
};

/**
 * Returns a function that can evaluate and invoke an expression on an array,
 * given the name of a higher order function available in Array.prototype.
 *
 * @param   {string}   func The name of the higher order function
 * @returns {function} A function that runs said higher order function
 */
function runHigherOrder(func) {
  return function(lines, expression, explicit) {
    var exp = (explicit) ? expression : utils.getBoundExpression(expression, '$');

    return lines[func](function($) {
      return eval(exp);
    });
  };
}
