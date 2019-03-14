const fs = require('fs-extra');
const path = require('path');
const glob = require('fast-glob');
const isUrl = require('is-url');
const {parse} = require('graphql');

const { findTags } = require('./tagFinder');
const {
  generateReasonCode,
  createTypeMap,
  generateNodes,
} = require('./graphql-to-reason');

function loadConfig(dir) {
  const configPath = path.join(dir, 'reasonql.config.js');
  if(!fs.existsSync(configPath)) {
    console.log(`reasonql.config.js file doesn't exist.`)
    process.exit();
  }

  let conf = require(configPath);
  conf = Object.assign({
    schema: '',
    localschema: '',
    src: './src',
    include: '**',
    exclude: [
      '**/node_modules/**', 
      '**/__mocks__/**', 
      '**/__tests__/**', 
      '**/.*/**',
    ],
    watch: false,
  }, conf);

  return conf;
}

function compileAll(conf) {
  console.log('');
  console.log(`[${currentTime()}] compile started`);
  let ast = loadServerSchema(conf);
  generateTypeFiles(conf, ast);
  console.log('compile ended.');
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function currentTime() {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  let ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  // add a zero in front of numbers<10
  h = checkTime(h);
  m = checkTime(m);
  s = checkTime(s);
  return `${h}:${m}:${s}${ampm}`;
}

function loadServerSchema({ schema }) {
  let ast = {};

  console.log('loading schema...');
  if(isUrl(schema)) {
    console.log('fetching schema from server...');
    // TODO: Should support later. Because it's more complicated than expected. 
    // Check 
    // https://github.com/graphql/graphql-js/blob/master/src/type/introspection.js and 
    // https://github.com/mhallin/graphql_ppx/blob/master/sendIntrospectionQuery.js
  } else if(schema) {
    console.log('parsing the schema file...');

    const schemaPath = path.join(process.cwd(), schema);
    if(fs.existsSync(schemaPath)) {
      let ext = path.extname(schemaPath);
      let code = '';
      if(ext == '.js') {
        code = fs.readFileSync(schemaPath).toString();
        let match = code.match(/gql`([\s\S]+)`/);
        if(match) {
          code = match[1];
        } else {
          console.log(`The file ${schema} doesn't have graphql tagged template literal "gql".`);
          process.exit();
        }
      } else if (ext == '.graphql' || ext == '.gql') {
        code = fs.readFileSync(schemaPath).toString();
      } else {
        console.log('The extension of server schema files should be .js, .graphql, .gql.');
        process.exit();
      }
      ast = parse(code);
    } else {
      console.log(`GraphQL schema file doesn't exist at ${schemaPath}`);
    }
  } else {
    console.log('"schema" field is required in reasonql.config.js');
  }

  return ast;
}

function generateTypeFiles({include, exclude, src}, schemaAst) {
  console.log('analyzing reason files...');
  let typeMap = createTypeMap(schemaAst);

  include = Array.isArray(include) ? include : [include];
  const patterns = include.map(inc => `${inc}/*.re`);

  const files = glob.sync(patterns, {
    cwd: src,
    ignore: exclude,
  });
  
  let gqlCodes = [];

  files.forEach(filePath => {
    let code = fs.readFileSync(path.join(src, filePath)).toString();
    gqlCodes = gqlCodes.concat(findTags(code));
  });

  let nodes = generateNodes(gqlCodes, typeMap);

  console.log('generating type files...');
  const DEST_DIR = path.join(src, '.reasonql');
  nodes.forEach(node => {
    generateTypeFile(DEST_DIR, node, typeMap);
  })
}

function generateTypeFile(DEST_DIR, node, typeMap) {
  let code = generateReasonCode(node, typeMap);
  fs.writeFileSync(path.join(DEST_DIR, `${node.fileName}.re`), code);
}

module.exports = {
  loadConfig,
  compileAll,
  currentTime,
}