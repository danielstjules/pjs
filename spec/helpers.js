/**
 * Helper functions for creating and testing pjs streams.
 */

var stream = require('stream');

var arrayStream, testStream;

exports.arrayStream = arrayStream = function(array) {
  array = array.slice(0);
  var readable = new stream.Readable({objectMode: true});

  readable._read = function() {
    this.push(array.shift());
    if (!array.length) this.push(null);
  };

  return readable;
};

exports.testStream = testStream = function(array, transform, fn) {
  array = array.slice(0);
  var readable = arrayStream(array);
  var result = [];

  var dst = new stream.Writable({objectMode: true});
  dst._write = function(chunk, encoding, next) {
    result.push(chunk);
    next();
  };

  dst.on('error', fn);
  dst.on('finish', function() {
    fn(null, result);
  });

  readable.pipe(transform, {end: false}).pipe(dst);
};
