const {
  loadConfig,
  loadServerSchema,
  generateSchemaTypes,
  generateTypeFiles,
} = require('./util')

let conf = loadConfig();
let ast = loadServerSchema(conf);
generateSchemaTypes(ast);
generateTypeFiles(conf, ast);