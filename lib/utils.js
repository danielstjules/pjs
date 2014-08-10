/**
 * Exports array utility functions.
 */

var utils = {};
module.exports = utils;

/**
 * Returns the minimum value in an array.
 *
 * @param   {*[]}    array The array for which to find its min
 * @returns {Number} Its minimum value
 */
utils.min = function(array) {
  return Math.min.apply(null, array);
};

/**
 * Returns the maximum value in an array.
 *
 * @param   {*[]}    array The array for which to find its max
 * @returns {Number} Its maximum value
 */
utils.max = function(array) {
  return Math.max.apply(null, array);
};

/**
 * Casts each element of the provided array to a Number and returns their sum.
 *
 * @param   {*[]}    array The array for which to calculate the sum
 * @returns {Number} The sum of its elements
 */
utils.sum = function(array) {
  return array.reduce(function(curr, prev) {
    return Number(curr) + Number(prev);
  });
};

/**
 * Casts each element of the array to a Number, and returns their mean value.
 *
 * @param   {*[]}    array The array for which to calculate the average
 * @returns {Number} The mean of its elements
 */
utils.avg = function(array) {
  return utils.sum(array) / array.length;
};

/**
 * Given an array, casts each element to a String and returns their
 * concatenated value.
 *
 * @param   {*[]}    array The array for which to concatenate its values
 * @returns {String} The concatenated string
 */
utils.concat = function(array) {
  return array.reduce(function(curr, prev) {
    return String(curr) + String(prev);
  });
};

/**
 * Given a string expression to be evaluated, binds any String properties and
 * methods to the provided variable. Returns the resulting string.
 *
 * @param {string} expression The expression to bind
 * @param {string} varName    Variable to which to bind
 */
utils.getBoundExpression = function(expression, varName) {
  Object.getOwnPropertyNames(String.prototype).forEach(function(key) {
    var pattern = new RegExp('([^\\w\\.]|^)(' + key + ')([^\\w\\.]|$)', 'g');
    expression = expression.replace(pattern, "$1" + varName + ".$2$3");
  });

  return expression;
};
