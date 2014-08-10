var pjs = {};

pjs.filter = runHigherOrder('filter');

pjs.map = runHigherOrder('map');

pjs.reduce = function(lines, expression, explicit) {
  var builtin = {sum: sum, avg: avg, concat: concat};
  if (builtin[expression]) {
    return builtin[expression](lines);
  }

  eval('var callback = ' + expression);

  return lines.reduce(callback);
};

module.exports = pjs;

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
