const fs = require('fs');
const path = require('path');
const {parse} = require('graphql');

const { generateEnumTypesCode } = require('../src/graphql-to-reason/enum');
const { compareTexts } = require('../src/test-util');

describe('error types', () => {
  let fixture = path.join(__dirname, '../__fixture__/enum/');
  let gql = fs.readFileSync(path.join(fixture, 'schema.graphql')).toString();
  let expected = fs.readFileSync(path.join(fixture, 'EnumTypes.re')).toString();
  let code = generateEnumTypesCode(parse(gql));

  compareTexts('generate EnumTypes.re file', expected, code);
})