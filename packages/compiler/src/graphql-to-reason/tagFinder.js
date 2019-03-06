const lineColumn = require('line-column');

function findTags(text) {
  let re = /gql\({\|([\s\S]*)\|}\)/g;

  let tags = [];
  let result;
  while ((result = re.exec(text)) !== null) {
    let {line, col: column} = lineColumn(text, result.index);
    tags.push({
      template: result[1],
      sourceLocationOffset: {
        line,
        column,
      }
    })
  }

  return tags;
}

exports.findTags = findTags;