const {
  commentOnTop,
  upperTheFirstCharacter,
  isScalar,
  getValidTypeName,
} = require('./util')

// Added comment for sections because template string literals break 
// the code indentation. And it makes code hard to read. 
function generateCodec(typeInfo) {
  let exportedNames = [];
  let arrayTypes = new Set();

  let validTypeName = name => {
    return upperTheFirstCharacter(getValidTypeName(typeInfo, name));
  }

  // Functions
  let functions = typeInfo.list.map(type => {
    let functionName = `decode${validTypeName(type.name)}`;
    exportedNames.push(functionName);
    
    return `
var ${functionName} = function (res) {
  return [
${type.fields.map(field => {
  let varname = `res.${field.name}`;

  if(isScalar(field.type)) {
    return `    ${varname},`;
  } else {
    let validType = validTypeName(field.type);
    let decoderName = field.array
      ? `decode${validType}Array`
      : `decode${validType}`;
    
    if (field.array) {
      arrayTypes.add(validType);
    }

    return field.option
      ? `    ${varname} ? ${decoderName}(${varname}) : undefined,`
      : `    ${decoderName}(${varname}),`;
  }
}).join('\n')}
  ]
}`.trim();
  }).join('\n\n');

  // Array Decoders
  let arrayDecoders = Array.from(arrayTypes).map(type => {
    exportedNames.push(`decode${type}Array`);
    return `
var decode${type}Array = function (arr) {
  return arr.map(item =>
    item ? decode${type}(item) : undefined
  )
}
`.trim()
  }
).join('\n\n')

  // exports part.
  let exported = exportedNames.map(name => 
    `exports.${name} = ${name};`
  ).join('\n').trim();

  return `
${commentOnTop()}

${functions}
${arrayDecoders ? `\n${arrayDecoders}\n` : ''}
${exported}
`.trim();
}

exports.generateCodec = generateCodec;