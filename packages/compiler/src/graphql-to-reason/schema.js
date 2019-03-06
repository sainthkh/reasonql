const {
  generateTypeCode,
  commentOnTop,
  childTypes,
  isScalar,
  handleRootTypeNames,
} = require('./util')

const {
  decodeField,
} = require('./decodeAST');

function generateTypeListFromSchema(ast) {
  // Create type map
  let types = {}
  ast.definitions.forEach(definition => {
    let kind = definition.kind;
    if (kind == "ObjectTypeDefinition") {
      let name = definition.name.value;
      let fields = definition.fields.map(field => {
        return decodeField(field);
      })

      types[name] = {
        name,
        fields,
      }
    }
  });

  let typeList = childTypes(types, types["Query"]);
  return typeList;
}

function generateReasonCode(typeList) {
  return `
${commentOnTop()}

${generateTypeCode(typeList)}

[@bs.module "./SchemaTypes.codec"]external decodeQueryResponse: Js.Json.t => queryResponse = "decodeQueryResponse";
`.trim();
}

// Added comment for sections because template string literals break 
// the code indentation. And it makes code hard to read. 
function generateCodec(typeList) {
  let exportedNames = [];
  let arrayTypes = new Set();

  // Functions
  let functions = typeList.map(type => {
    let name = handleRootTypeNames(type.name);
    let functionName = `decode${name}`;
    exportedNames.push(functionName);
    
    return `
var ${functionName} = function (res) {
  return [
${type.fields.map(field => {
  let varname = `res.${field.name}`;

  if(isScalar(field.type)) {
    return `    ${varname},`;
  } else {
    let decoderName = field.array
      ? `decode${field.type}Array`
      : `decode${field.type}`;
    
    if (field.array) {
      arrayTypes.add(field.type);
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

exports.schemaToReason = function(ast) {
  let typeList = generateTypeListFromSchema(ast);
  return {
    reason: generateReasonCode(typeList),
    codec: generateCodec(typeList),
  };
}
