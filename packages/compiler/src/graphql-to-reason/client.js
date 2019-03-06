const {
  generateTypeCode,
  commentOnTop,
  childTypes,
  isScalar,
} = require('./util');

const {
  decodeField,
} = require('./decodeAST');

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
    });

    return types;
  } else {
    return [];
  }
}

function generateReasonCode(typeList, args) {
  return `
${commentOnTop()}

${generateTypeCode(typeList)}

${generateVariablesEncoder(args)}

type schemaQueryResponse = SchemaTypes.queryResponse;
let decodeResponse = SchemaTypes.decodeQueryResponse;
`.trim();
}

function generateVariablesEncoder(args) {
  if(args.length > 0) {
    return `
[@bs.deriving abstract]
${generateTypeCode(args)}

let encodeVariables: queryVars => variablesType = (vars) => variablesType(${generateVaraiblesArgs(args[0].fields)});
`.trim();
  } else {
    return `
type variablesType = Js.Dict.t(Js.Json.t);
let encodeVariables: unit => variablesType = () => Js.Dict.empty();
`.trim();
  }
}

function generateVaraiblesArgs(fields) {
  return fields.map(field => `~${field.name}=vars.${field.name}`).join(',')
}

exports.queryToReason = function(ast, typeMap) {
  let queryRoot = ast.definitions[0];
  let typeList = generateTypeListFromQuery(queryRoot, typeMap);
  let args = argumentTypes(queryRoot.variableDefinitions);
  return generateReasonCode(typeList, args);
}