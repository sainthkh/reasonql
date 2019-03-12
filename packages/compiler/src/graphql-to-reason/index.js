const {createTypeMap} = require('./type');
const {generateNodes} = require('./node');
const {generateReasonCode} = require('./reason');
const {findTags} = require('./tagFinder');

module.exports = {
  generateReasonCode,
  createTypeMap,
  generateNodes,
  findTags,
}