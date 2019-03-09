function extractChildFragments(selections, result = []) {
  selections.forEach(({ kind, name, selectionSet }) => {
    if (kind == "FragmentSpread") {
      result.push(name.value);
    } else if (kind == 'Field' && selectionSet) {
      result = extractChildFragments(selectionSet, result);
    }
  })
  
  return result;
}

function generateFullQueryCode(queryNode) {
  return queryNode.code;
}

exports.extractChildFragments = extractChildFragments;
exports.generateFullQueryCode = generateFullQueryCode;