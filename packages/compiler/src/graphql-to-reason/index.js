const {queryToReason} = require('./client');
const {createTypeMap} = require('./typemap');
const {findTags} = require('./tagFinder');

module.exports = {
  queryToReason,
  createTypeMap,
  findTags,
}