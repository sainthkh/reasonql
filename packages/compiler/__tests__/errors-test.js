const fs = require('fs');
const path = require('path');
const {parse} = require('graphql');

const { generateErrorsCode } = require('../src/graphql-to-reason/errors');
const { compareTexts } = require('../src/test-util');

describe('error types', () => {
  let fixture = path.join(__dirname, '../__fixture__/errors/');
  let gql = fs.readFileSync(path.join(fixture, 'errors.graphql')).toString();
  let expected = fs.readFileSync(path.join(fixture, 'QueryErrors.re')).toString();
  let code = generateErrorsCode(parse(gql));

  compareTexts('generate QueryErrors.re file', expected, code);
})