const {
  commentOnTop,
  upperTheFirstCharacter,
  isScalar,
  isFragmentTypeName,
  getValidTypeName,
} = require('./util')

// Added comment for sections because template string literals break 
// the code indentation. And it makes code hard to read. 
function generateCodec(typeInfo) {
  let exportedNames = [];
  let arrayTypes = new Set();
  return `
${commentOnTop()}
${generateImports(typeInfo)}
${generateFunctions(typeInfo, arrayTypes, exportedNames)}
${generateArrayDecoders(arrayTypes, exportedNames)}
${generateExportedNames(exportedNames)}
`.trim();
}

function generateImports(typeInfo) {
  let importedTypes = {};

  typeInfo.list.forEach(type => {
    type.fields.forEach(field => {
      if(isFragmentTypeName(field.type)) {
        let [component, typeName] = field.type.split('.');

        if(!importedTypes[component]) {
          importedTypes[component] = []
        }

        importedTypes[component].push(typeName);
      }
    });
  });

  let importedFuncs = 
    Object.entries(importedTypes)
    .map(([component, types]) => {
      let funcs = types.map(type => {
        type = upperTheFirstCharacter(type);
        return `  decode${type}: ${component}_decode${type},`
      }).join('\n')

      return `
var {
${funcs}
} = require('./${component}.codec');
      `.trim();
    })
  
    return importedFuncs.length > 0 
      ? `\n${importedFuncs.join('\n\n')}\n`
      : '';
}

function generateFunctions(typeInfo, arrayTypes, exportedNames) {
  let validTypeName = name => {
    return upperTheFirstCharacter(getValidTypeName(typeInfo, name));
  }

  let typeCodes = typeInfo.list.map(type => {
    let functionName = `decode${validTypeName(type.name)}`;
    exportedNames.push(functionName);
    
    return `
var ${functionName} = function (res) {
  return [
${type.fields.map(field => {
  let varname = `res.${field.name}`;

  if(isScalar(field.type)) {
    return `    ${varname},`;
  } else if(isFragmentTypeName(field.type)) {
    let [component, typeName] = field.type.split('.');
    typeName = upperTheFirstCharacter(typeName);
    return `    ${component}_decode${typeName}(res),`
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
  });
  
  return typeCodes.join('\n\n');
}

function generateArrayDecoders(arrayTypes, exportedNames) {
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
)

  return arrayDecoders.length > 0
    ? `\n${arrayDecoders.join('\n\n')}\n`
    : ''
}

function generateExportedNames(exportedNames) {
  return exportedNames.map(name => 
    `exports.${name} = ${name};`
  ).join('\n').trim();
}

exports.generateCodec = generateCodec;