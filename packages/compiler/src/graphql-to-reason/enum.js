const { enumTypes } = require('./type');
const {
  upperTheFirstCharacter,
  lowerTheFirstCharacter,
} = require('./util')

const camelCase = require('lodash/camelCase');

function generateEnumTypesCode(ast) {
  let types = enumTypes(ast);
  
  return types.map(type => `
type ${lowerTheFirstCharacter(type.name)} = 
${type.values.map(v => `  | ${upperTheFirstCharacter(camelCase(v))}`).join('\n')}
  ;

[%%raw {|
var decode${type.name} = function (en) {
  let t = {
${type.values.map((v, i) => `    "${v}": ${i},`).join('\n')}
  };

  return t[en];
}

var encode${type.name} = function (en) {
  let t = [
${type.values.map((v, i) => `    "${v}",`).join('\n')}
  ];

  return t[en];
}

exports.decodePatchSize = decodePatchSize;
exports.encodePatchSize = encodePatchSize;
|}]
`.trim())
.join('\n\n');
}

exports.generateEnumTypesCode = generateEnumTypesCode;