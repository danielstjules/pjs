/**
 * The pjs library module exports three functions: filter, map and reduce.
 */

/**
 * Accepts an array, an expression to evaluate, and a boolean indicating
 * whether or not to explicitly require that "$" be used to refer to the
 * current element. Given these arguments, reduce is invoked, using the
 * evaluated expression as the return statement for the callback. Any values
 * that resulted in the expression evaluating as true are included in the
 * returned array.
 *
 * @param  {*[]}    array      The array to filter
 * @param  {string} expression The expression to evaluate
 * @param  {bool}   explicit   Whether or not to require "$"
 * returns {*[]}    A filtered array
 */
exports.filter = runHigherOrder('filter');

/**
 * Accepts an array, an expression to evaluate, and a boolean indicating
 * whether or not to explicitly require that "$" be used to refer to the
 * current element. Given these arguments, map is invoked, using the evaluated
 * expression as the return statement for the callback. Returns an array
 * containing the modified values.
 *
 * @param  {*[]}    array      The array to map
 * @param  {string} expression The expression to evaluate
 * @param  {bool}   explicit   Whether or not to require "$"
 * returns {*[]}    A modified array
 */
exports.map = runHigherOrder('map');

/**
 * Accepts an array and an expression to evaluate. It invokes a built-in
 * function if expression is one of: sum, avg or concat. Otherwise, it
 * evaluates the passed expression, passing it as the callback to reduce.
 *
 * @param  {*[]}    array      The array to reduce
 * @param  {string} expression The expression to evaluate
 * returns {*}      A reduced value
 */
exports.reduce = function(lines, expression) {
  var builtin = {sum: sum, avg: avg, concat: concat};
  if (builtin[expression]) {
    return builtin[expression](lines);
  }

  eval('var callback = ' + expression);

  return lines.reduce(callback);
};

function runHigherOrder(func) {
  return function(lines, expression, explicit) {
    return lines[func](function($) {
      var exp = (explicit) ? expression : getBoundExpression('$', expression);

      return eval(exp);
    });
  };
}

function getBoundExpression(varName, expression) {
  Object.getOwnPropertyNames(String.prototype).forEach(function(key) {
    var pattern = new RegExp('([\\W]|^)(' + key + ')([\\W]|$)', 'g');
    expression = expression.replace(pattern, "$1" + varName + ".$2$3");
  });

  return expression;
}

function sum(lines) {
  return lines.reduce(function(curr, prev) {
    return Number(curr) + Number(prev);
  });
}

function avg(lines) {
  return sum(lines) / lines.length;
}

function concat(lines) {
  return lines.reduce(function(curr, prev) {
    return String(curr) + String(prev);
  });
}
