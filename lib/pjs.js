var pjs = {};
module.exports = pjs;

pjs.filter = simpleFunc('filter');

pjs.map = simpleFunc('map');

pjs.reduce = function(lines, expression, explicit) {
  return lines;
};

function simpleFunc(func) {
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
