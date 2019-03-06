const {
  loadConfig,
  loadServerSchema,
  extendWithClientSchema,
  generateSchemaTypes,
  generateTypeFiles,
} = require('./util')

let conf = loadConfig();
let ast = loadServerSchema(conf);
ast = extendWithClientSchema(conf, ast);
generateSchemaTypes(ast);
generateTypeFiles(conf, ast);