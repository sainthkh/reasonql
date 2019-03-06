const fs = require('fs');
const path = require('path');

const {parse} = require('graphql');
const {getDirectories, compareTexts} = require('../src/test-util');
const fixtures = getDirectories(path.join(__dirname, '../__fixture__/schema'));

const {schemaToReason} = require('../src/graphql-to-reason');

describe(`schema tests`, () => {
  fixtures.forEach(fixture => {
    /* 
    // Code for partial test.
    // Commented out for later use. 
    let tests = ['non-nullable-scalar', 'nullable-scalar', 'object'];
    if(!tests.includes(path.basename(fixture))) return;
    //*/

    let schemaPath = path.join(fixture, 'schema.graphql');
    let schema = parse(fs.readFileSync(schemaPath, 'utf8'));

    let result = schemaToReason(schema);
    let reason = fs.readFileSync(path.join(fixture, 'SchemaTypes.re')).toString();
    let codec = fs.readFileSync(path.join(fixture, 'SchemaTypes.codec.js')).toString();

    compareTexts(`${path.basename(fixture)} reason code`, result.reason, reason);
    compareTexts(`${path.basename(fixture)} codec code`, result.codec, codec);
  })
})