const {schemaToReason} = require('./schema');
const {queryToReason} = require('./client');
const {createTypeMap} = require('./typemap');
const {findTags} = require('./tagFinder');

module.exports = {
  schemaToReason,
  queryToReason,
  createTypeMap,
  findTags,
}