const {parse} = require('graphql');

const fs = require('fs');
const path = require('path');

const {
  queryToReason,
  createTypeMap,
} = require('../src/graphql-to-reason')

const {getDirectories, compareTexts} = require('../src/test-util');
const fixtures = getDirectories(path.join(__dirname, '../__fixture__/clientQuery'));

describe(`client query tests`, () => {
  fixtures.forEach(fixture => {
    /*
    // Code for partial test.
    // Commented out for later use. 
    let tests = ['non-nullable-scalar', 'nullable-scalar', 'array'];
    if(!tests.includes(path.basename(fixture))) return;
    //*/

    let schemaPath = path.join(fixture, 'schema.graphql');
    let schemaAst = parse(fs.readFileSync(schemaPath).toString());
    let typeMap = createTypeMap(schemaAst);
    
    let codePath = path.join(fixture, 'code.graphql');
    let ast = parse(fs.readFileSync(codePath).toString());
    let code = queryToReason(ast, typeMap);
    let reason = fs.readFileSync(path.join(fixture, 'types.re')).toString();
    
    compareTexts(`${path.basename(fixture)} test`, code, reason);
  })
})