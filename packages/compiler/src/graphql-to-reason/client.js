const {
  decodeField,
} = require('./decodeAST');

const { 
  generateCodec,
  generateReasonCode,
  isScalar,
} = require('./generator')

function makeTypeInfo(ast, isFragment, typeMap) {
  let types = {};
  let rootType = isFragment 
    ? ast.typeCondition.name.value
    : "Query"
  extractType(types, ast, [], typeMap, rootType);

  let typeList = childTypes(types, types[rootType]);
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

function extractType(types, ast, selectionNames, typeMap, currentType, userDefinedTypeName) {
  let fields = ast.selectionSet.selections.map(selection => {
    if(selection.kind == "FragmentSpread") {
      let fragment = selection.name.value;
      let [component, typeName] = fragment.split('_');

      return {
        name: `f_${typeName}`,
        type: `${component}.${typeName}`,
      }
    } else {
      let name = selection.name.value;
      let typeObj = typeMap[currentType].fields[selection.name.value];
      let typeName = typeObj.type;
      
      let userDefinedType = undefined;
      if (selection.directives.length > 0) {
        selection.directives.forEach(d => {
          let name = d.name.value;
          if(name == "singular" || name == "reasontype") {
            userDefinedType = d.arguments[0].value.value;
          }
        })
      }

      if(selection.selectionSet) {
        extractType(types, selection, [...selectionNames, name], typeMap, typeName, userDefinedType);
      }

      return {
        ...typeObj,
        name,
        type: isScalar(typeName)
          ? typeName
          : [...selectionNames, name, typeName].join('_'),
        userDefinedType: userDefinedTypeName,
      }
    }
  })
  
  let name = [...selectionNames, currentType].join('_');
  types[name] = {
    name,
    selectionName: selectionNames.length > 0 
      ? selectionNames[selectionNames.length - 1]
      : currentType,
    fields,
    userDefinedTypeName,
  }
}

function childTypes(types, type) {
  // When fragment, type can be undefined. 
  if(!type) {
    return [];
  }

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
  // When args is from Fragments, it's undefined. 
  if(!args) {
    return {
      list: [],
      map: {},
      unconflictedNames: [],
    }
  }

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
  let typeInfo = makeTypeInfo(queryRoot, node.isFragment, typeMap);
  let argsTypeInfo = argumentTypes(queryRoot.variableDefinitions);
  return {
    reason: generateReasonCode(node, typeInfo, argsTypeInfo),
    codec: generateCodec(typeInfo),
  }
}