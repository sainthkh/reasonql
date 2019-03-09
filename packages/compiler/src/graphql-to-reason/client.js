const {
  decodeField,
} = require('./decodeAST');

const { 
  generateCodec,
  generateReasonCode,
  isScalar,
} = require('./generator')

function makeTypeInfo(ast, typeMap) {
  let types = {};
  extractType(types, ast, [], typeMap, "Query");

  let typeList = childTypes(types, types["Query"]);
  let typeInfo = {
    list: typeList,
    map: types,
    unconflictedNames: 
      typeList
      .map(type => type.selectionName)
      .reduce((prev, curr) => {
        return prev.includes(curr) 
          ? prev.filter(name => name != curr)
          : [...prev, curr]
      }, [])
  }
  return typeInfo;
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
    selectionName: selectionNames.length > 0 
      ? selectionNames[selectionNames.length - 1]
      : currentType,
    fields,
  }
}

function childTypes(types, type) {
  let typeList = []
  type.fields.reverse().forEach(field => {
    if(!isScalar(field.type)){
      typeList = childTypes(types, types[field.type]).concat(typeList);
    }
  });
  type.fields.reverse();
  if(!type.inList) {
    typeList.push(type);
    type.inList = true;
  }
  return typeList;
}

function argumentTypes(args) {
  let fields = args.map(arg => {
    return decodeField(arg);
  })

  let list = [];
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

    list = types;
  }

  let map = {};

  list.forEach(type => {
    map[type.name] = type;
  })

  return {
    list, 
    map,
    unconflictedNames: 
      list.map(type => type.name)
  }
}

exports.queryToReason = function(node, typeMap) {
  let queryRoot = node.ast.definitions[0];
  let typeInfo = makeTypeInfo(queryRoot, typeMap);
  let argsTypeInfo = argumentTypes(queryRoot.variableDefinitions);
  return {
    reason: generateReasonCode(node, typeInfo, argsTypeInfo),
    codec: generateCodec(typeInfo),
  }
}