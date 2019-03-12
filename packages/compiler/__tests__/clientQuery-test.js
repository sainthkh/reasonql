const {parse} = require('graphql');

const fs = require('fs');
const path = require('path');

const {
  generateReasonCode,
  createTypeMap,
  generateNodes,
} = require('../src/graphql-to-reason')

const {
  getDirectories, 
  getFiles,
  compareTexts
} = require('../src/test-util');
const fixtures = getDirectories(path.join(__dirname, '../__fixture__/clientQuery'));

describe(`client query tests`, () => {
  fixtures.forEach(fixture => {
    // Code for partial test.
    // Commented out for later use. 
    let tests = [
      //'non-nullable-scalar', 
      //'nullable-scalar', 
      //'array',
      //'object',
      'fragment-simple',
      'fragment-diamond',
    ];
    if(!tests.includes(path.basename(fixture))) return;
    //*/

    let schemaPath = path.join(fixture, 'graphql/schema.graphql');
    let schemaAst = parse(fs.readFileSync(schemaPath).toString());
    let typeMap = createTypeMap(schemaAst);
    
    let files = getFiles(path.join(fixture, 'graphql'));
    files = files.filter(p => path.basename(p) != 'schema.graphql');

    let gqlCodes = files.map(file => {
      return {
        template: fs.readFileSync(file).toString(),
      };
    })

    let nodes = generateNodes(gqlCodes, typeMap);

    nodes.forEach(node => {
      let name = node.fileName;

      let result = generateReasonCode(node, typeMap);
      let reason = fs.readFileSync(path.join(fixture, `result/${name}.re`)).toString();
      
      compareTexts(`${path.basename(fixture)} ${name} reasonml test`, result, reason);
    })
  })
})