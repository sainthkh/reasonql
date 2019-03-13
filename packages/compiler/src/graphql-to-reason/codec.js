function generateCodec(typeList, isFragment, fileName) {
  let arrayTypes = new Set();
  return `
${generateFunctions(typeList, isFragment, fileName, arrayTypes)}
${generateArrayDecoders(arrayTypes)}
`.trim();
}

function generateFunctions(typeList, isFragment, fileName, arrayTypes) {
  let typeCodes = typeList.map(type => {
    let functionName = `decode${upperTheFirstCharacter(type.typeName)}`;
    functionName = isFragment
      ? `${fileName}_${functionName}`
      : functionName;
    
    return `
var ${functionName} = function (res) {
  return [
${type.fields.map(field => {
  let varname = `res.${field.name}`;

  if(field.scalar) {
    return `    ${varname},`;
  } else if(field.fragment) {
    let [component, typeName] = field.type.split('.');
    typeName = upperTheFirstCharacter(typeName);
    return `    ${component}_decode${typeName}(res),`
  } else {
    let validType = upperTheFirstCharacter(field.typeName);
    let decoderName = field.array
      ? `decode${validType}Array`
      : `decode${validType}`;
    
    if (field.array) {
      arrayTypes.add({
        typeName: validType,
        contentOption: field.contentOption,
      });
    }

    return field.option
      ? `    ${varname} ? ${decoderName}(${varname}) : undefined,`
      : `    ${decoderName}(${varname}),`;
  }
}).join('\n')}
  ]
}`.trim();
  });
  
  return typeCodes.join('\n\n');
}

function generateArrayDecoders(arrayTypes) {
  let arrayDecoders = Array.from(arrayTypes).map(type => {
    return `
var decode${type.typeName}Array = function (arr) {
  return arr.map(item =>
    ${
      type.contentOption 
      ? `item ? decode${type.typeName}(item) : undefined`
      : `decode${type.typeName}(item)`
    }
  )
}
`.trim()
  })

  return arrayDecoders.length > 0
    ? `\n${arrayDecoders.join('\n\n')}\n`
    : ''
}

function upperTheFirstCharacter(name) {
  return name[0].toUpperCase() + name.substring(1);
}

exports.generateCodec = generateCodec;