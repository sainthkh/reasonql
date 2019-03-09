const {
  generateTypeCode,
  commentOnTop,
  childTypes,
  isScalar,
} = require('./util');

const {
  decodeField,
} = require('./decodeAST');

const {
  generateFullQueryCode,
} = require('./fragment')

function generateTypeListFromQuery(ast, typeMap) {
  let types = {};
  extractType(types, ast, [], typeMap, "Query");

  let typeList = childTypes(types, types["Query"]);
  return typeList;
}

function extractType(types, ast, selectionNames, typeMap, currentType) {
  let fields = ast.selectionSet.selections.map(selection => {
    let name = selection.name.value;
    let typeObj = typeMap[currentType].fields[selection.name.value];
    let typeName = typeObj.type;
    
    if(selection.selectionSet) {
      extractType(types, selection, [...selectionNames, name], typeMap, typeName);
    }

    return {
      ...typeObj,
      name,
      type: isScalar(typeName)
        ? typeName
        : [...selectionNames, name, typeName].join('_'),
    }
  })
  
  let name = [...selectionNames, currentType].join('_');
  types[name] = {
    name,
    fields,
  }
}

function argumentTypes(args) {
  let fields = args.map(arg => {
    return decodeField(arg);
  })

  if (fields.length > 0) {
    let types = [];
    types.push({
      name: 'variablesType',
      fields,
    });
    types.push({
      name: 'queryVars',
      fields,
      abstract: true,
    });

    return types;
  } else {
    return [];
  }
}

function generateReasonCode(node, typeList, args) {
  return `
${commentOnTop()}

let query = {|
${generateFullQueryCode(node)}
|}

${generateTypeCode(typeList)}

${generateVariablesEncoder(args)}

[@bs.module "./AppQuery.codec"]external decodeQueryResult: Js.Json.t => queryResult = "decodeQueryResult";
`.trim();
}

function generateVariablesEncoder(args) {
  if(args.length > 0) {
    return `
${generateTypeCode(args)}

let encodeVariables: variablesType => queryVars = (vars) => variablesType(${generateVaraiblesArgs(args[0].fields)});
`.trim();
  } else {
    return `
type variablesType = Js.Dict.t(Js.Json.t);
let encodeVariables: variablesType => Js.Json.t = vars => Js.Json.object_(vars);
`.trim();
  }
}

function generateVaraiblesArgs(fields) {
  return fields.map(field => `~${field.name}=vars.${field.name}`).join(',')
}

// Added comment for sections because template string literals break 
// the code indentation. And it makes code hard to read. 
function generateCodec(typeList) {
  let exportedNames = [];
  let arrayTypes = new Set();

  // Functions
  let functions = typeList.map(type => {
    let specialNames = ["Query", "Mutation", "Subscription"];
    let name = specialNames.includes(type.name) ? "QueryResult" : type.name;

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

exports.queryToReason = function(node, typeMap) {
  let queryRoot = node.ast.definitions[0];
  let typeList = generateTypeListFromQuery(queryRoot, typeMap);
  let args = argumentTypes(queryRoot.variableDefinitions);
  return {
    reason: generateReasonCode(node, typeList, args),
    codec: generateCodec(typeList),
  }
}