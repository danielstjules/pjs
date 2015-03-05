/**
 * Exports array utility functions, as well as a null object.
 */

var utils = {};
module.exports = utils;

/**
 * A null object representing a null value in a stream, so as not to terminate
 * an object stream.
 *
 * @private
 *
 * @var {object}
 */
var _nullObject = utils._nullObject = {value: null};

/**
 * Returns the length of the array.
 *
 * @param   {*[]}    array
 * @returns {Number} Length of the array
 */
utils.length = function(array) {
  return array.length;
};

/**
 * Returns the minimum value in an array. Mimics Math.min by casting values
 * to a number, including the nullObject/null.
 *
 * @param   {*[]}    array The array for which to find its min
 * @returns {Number} Its minimum value
 */
utils.min = function(array) {
  var i, min, curr;
  min = (array[0] === _nullObject) ? 0 : Number(array[0]);

  for (i = 1; i < array.length; i++) {
    if (array[i] === _nullObject) {
      array[i] = 0;
    }

    curr = Number(array[i]);
    if (curr < min) {
      min = curr;
    }
  }

  return min;
};

/**
 * Returns the maximum value in an array. Mimics Math.max by casting values
 * to a number, including the nullObject/null.
 *
 * @param   {*[]}    array The array for which to find its max
 * @returns {Number} Its maximum value
 */
utils.max = function(array) {
  var i, max, curr;
  max = (array[0] === _nullObject) ? 0 : Number(array[0]);

  for (i = 1; i < array.length; i++) {
    if (array[i] === _nullObject) {
      array[i] = 0;
    }

    curr = Number(array[i]);
    if (curr > max) {
      max = curr;
    }
  }

  return max;
};

/**
 * Casts each element of the provided array to a Number and returns their sum.
 *
 * @param   {*[]}    array The array for which to calculate the sum
 * @returns {Number} The sum of its elements
 */
utils.sum = function(array) {
  return array.reduce(function(curr, prev) {
    if (curr === _nullObject) {
      curr = null;
    }
    if (prev === _nullObject) {
      prev = null;
    }

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
    if (curr === _nullObject) {
      curr = null;
    }
    if (prev === _nullObject) {
      prev = null;
    }

    return String(curr) + String(prev);
  });
};
