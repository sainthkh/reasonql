function makeTypeList(queryRoot, isFragment, typeMap) {
  let types = {};
  let rootType = isFragment 
    ? queryRoot.typeCondition.name.value
    : "Query"
  extractType(types, queryRoot, [], typeMap, rootType);

  let typeList = childTypes(types, types[rootType]);
  typeList = validTypeNames(types, typeList);

  return typeList;
}

function extractType(types, ast, selectionNames, typeMap, currentType, userDefinedTypeName) {
  let fields = ast.selectionSet.selections.map(selection => {
    if(selection.kind == "FragmentSpread") {
      let fragment = selection.name.value;
      let [component, typeName] = fragment.split('_');

      return {
        name: `f_${typeName}`,
        type: `${component}.${typeName}`,
        fragment: true,
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
        scalar: isScalar(typeName)
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

function validTypeNames(types, typeList) {
  let unconflictedNames = 
    typeList
    .map(type => type.selectionName)
    .reduce((prev, curr) => {
      return prev.includes(curr) 
        ? prev.filter(name => name != curr)
        : [...prev, curr]
    }, []);
  
  for(var i = 0; i < typeList.length; i++) {
    let type = typeList[i];
    type.typeName = getValidTypeName(types, unconflictedNames, type.name);

    type.fields = type.fields.map(field => {
      field.typeName = getValidTypeName(types, unconflictedNames, field.type);
      return field;
    })
  }

  return typeList;
}

function argumentTypes(args) {
  // When args is from Fragments, it's undefined. 
  if(!args) {
    return []
  }

  let fields = args.map(arg => {
    return decodeType(arg.variable.name.value, arg);
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

  list = validTypeNames(map, list);

  return list;
}

function getValidTypeName(types, unconflictedNames, typeName) {
  if(isScalar(typeName)) {
    let typeNames = {
      "ID": "string",
      "String": "string",
      "Boolean": "bool",
      "Int": "int",
      "Float": "float",
    };

    return typeNames[typeName];
  } else if(isFragmentTypeName(typeName)) {
    return typeName;
  } else {
    let {selectionName, userDefinedTypeName} = types[typeName];
    let name = 
      userDefinedTypeName 
        ? userDefinedTypeName
        : unconflictedNames.includes(selectionName)
          ? selectionName
          : typeName

    let rootNames = ["Query", "Mutation", "Subscription"];
    name = rootNames.includes(name) ? name + "Result" : name;

    return lowerTheFirstCharacter(name);
  }
}

function isScalar(type) {
  let scalarTypes = ["ID", "String", "Int", "Float", "Boolean"];
  return scalarTypes.includes(type);
}

function isFragmentTypeName(type) {
  return type.includes(".");
}

function lowerTheFirstCharacter(name) {
  return name[0].toLowerCase() + name.substring(1);
}

function decodeType(name, field) {
  switch(field.type.kind) {
  case "NamedType": 
    return {
      name,
      type: field.type.name.value,
      option: true,
    }
  case "NonNullType": 
    if(field.type.type.kind != "ListType") {
      return {
        name,
        type: field.type.type.name.value,
        option: false,
      }
    } else {
      let nullable = field.type.type.type.kind == "NamedType";
      return {
        name, 
        type: nullable
          ? field.type.type.type.name.value
          : field.type.type.type.type.name.value,
        option: false,
        array: true,
        contentOption: nullable,
      }
    }
  case "ListType":
    let nullableType = field.type.type.kind == "NamedType";
    return {
      name,
      type: nullableType
        ? field.type.type.name.value
        : field.type.type.type.name.value,
      option: true,
      array: true,
      contentOption: nullableType,
    }
  }
}

function createTypeMap(ast) {
  let types = {}
  ast.definitions.forEach(definition => {
    let kind = definition.kind;
    if (kind == "ObjectTypeDefinition") {
      let name = definition.name.value;
      let fields = {}
      definition.fields.forEach(field => {
        let data = decodeType(field.name.value, field);
        fields[data.name] = data;
      })

      types[name] = {
        name,
        fields,
      }
    }
  });

  return types;
}

exports.createTypeMap = createTypeMap;
exports.makeTypeList = makeTypeList;
exports.argumentTypes = argumentTypes;
