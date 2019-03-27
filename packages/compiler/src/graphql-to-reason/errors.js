const { errorTypes } = require('./type');
const { generateTypeCode } = require('./reason')

function generateErrorsCode(ast) {
  let types = errorTypes(ast);

  return `
${types.map(type => generateErrorTypeCode(type)).join('\n\n')}
`.trim();
}

function generateErrorTypeCode(type) {
  return `
${generateTypeCode([type])}

[%%raw {|
var decode${type.name} = function (ext) {
  return [
${type.fields.map(field => {
  if(field.name == 'code') {
    return `    ext.code,`;
  } else {
    return `    ext.exception.${field.name},`;
  }
}).join('\n')}
  ]
}
|}]

[@bs.val]external decode${type.name}Js: Js.Json.t => ${type.typeName} = "decode${type.name}";
let decode${type.name} = decode${type.name}Js;
`.trim();
}

exports.generateErrorsCode = generateErrorsCode;