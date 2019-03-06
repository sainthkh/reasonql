const {
  decodeField
} = require('./decodeAST');

function createTypeMap(ast) {
  let types = {}
  ast.definitions.forEach(definition => {
    let kind = definition.kind;
    if (kind == "ObjectTypeDefinition") {
      let name = definition.name.value;
      let fields = {}
      definition.fields.forEach(field => {
        let data = decodeField(field);
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