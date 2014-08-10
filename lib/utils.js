/**
 * Exports array utility functions.
 */

module.exports = {
  sum:    sum,
  avg:    avg,
  concat: concat
};

/**
 * Casts each element of the provided array to a Number and returns their sum.
 *
 * @param   {*[]}    array The array for which to calculate the sum
 * @returns {Number} The sum of its elements
 */
function sum(array) {
  return array.reduce(function(curr, prev) {
    return Number(curr) + Number(prev);
  });
}

/**
 * Casts each element of the array to a Number, and returns their mean value.
 *
 * @param   {*[]}    array The array for which to calculate the average
 * @returns {Number} The mean of its elements
 */
function avg(array) {
  return sum(array) / array.length;
}

/**
 * Given an array, casts each element to a String and returns their
 * concatenated value.
 *
 * @param   {*[]}    array The array for which to concatenate its values
 * @returns {String} The concatenated string
 */
function concat(array) {
  return array.reduce(function(curr, prev) {
    return String(curr) + String(prev);
  });
}
