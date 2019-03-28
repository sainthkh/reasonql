const { upperTheFirstCharacter } = require('./util');

function generateDecoder(typeList, isFragment, fileName) {
  let arrayTypes = new Set();
  return `
${decoderFunctions(typeList, isFragment, fileName, arrayTypes)}
${decoderArrayDecoders(arrayTypes)}
`.trim();
}

function decoderFunctions(typeList, isFragment, fileName, arrayTypes) {
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

function decoderArrayDecoders(arrayTypes) {
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

function generateEncoder(args) {
  let encoder = '';
  if(args.length == 0) {
    encoder = `
var encodeVariables = function (v) {
  return {}
}`.trim();
  } else {
    let arrayTypes = new Set();
    encoder = `
${encoderFunctions(args, arrayTypes)}
${encoderArrayFunctions(arrayTypes)}
`.trim();
  }

  return `
[%%raw {|
${encoder}
|}]

[@bs.val]external encodeVariablesJs: variablesType => Js.Json.t = "encodeVariables";
let encodeVariables = encodeVariablesJs;
`.trim();
}

function encoderFunctions(args, arrayTypes) {
  let argCodes = args.map(arg => {
    let typeName = arg.typeName == "variablesType"
      ? "Variables"
      : upperTheFirstCharacter(arg.typeName)
    return `
var encode${typeName} = function (v) {
  return {
${arg.fields.map((field, i) => {
  let v = `v[${i}]`
  if(field.scalar) {
    return `    ${field.name}: ${v},`;
  } else {
    let fieldTypeName = upperTheFirstCharacter(field.typeName);
    let encoderName = field.array
      ? `encode${fieldTypeName}Array`
      : `encode${fieldTypeName}`;
    
    if (field.array) {
      arrayTypes.add({
        typeName: fieldTypeName,
        contentOption: field.contentOption,
      })
    }

    return field.option
      ? `    ${field.name}: ${v} ? ${encoderName}(${v}) : undefined,`
      : `    ${field.name}: ${encoderName}(${v}),`
  }
}).join('\n')}
  }
}`.trim();
  })

  return argCodes.join('\n\n');
}

function encoderArrayFunctions(arrayTypes) {
  let arrayEncoders = Array.from(arrayTypes).map(type => {
    return `
var encode${type.typeName}Array = function (ar) {
  let r = [];
  ar.forEach(v =>
    ${
      type.contentOption
      ? `r.push(v ? encode${type.typeName}(v) : undefined)`
      : `r.push(encode${type.typeName}(v))`
    }
  );
  return r;
}`.trim();
  })
  return arrayEncoders.length > 0
    ? `\n${arrayEncoders.join('\n\n')}\n`
    : '';
}

exports.generateDecoder = generateDecoder;
exports.generateEncoder = generateEncoder;