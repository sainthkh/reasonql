const {parse} = require('graphql');
const {makeTypeList, argumentTypes} = require('./type');
const {generateDecoder} = require('./codec');

function generateNodes(gqlCodes, typeMap, operationRoots) {
  let nodes = gqlCodes.map(code => {
    let ast = parse(code.template);
    let queryRoot = ast.definitions[0];
    
    let name = queryRoot.name.value;
    let isFragment = queryRoot.kind == "FragmentDefinition";
    
    let fileName = isFragment
      ? fragmentFileName(name)
      : name;
    let typeList = isFragment
      ? ast.definitions
        .map(def => makeTypeList(def, operationRoots, isFragment, typeMap))
        .reduce((prev, current) => [...prev, ...current], [])
      : makeTypeList(queryRoot, operationRoots, isFragment, typeMap);

    return {
      code: code.template.trim(),
      ast,
      isFragment,
      fileName,
      typeList,
      codec: generateDecoder(typeList, isFragment, fileName),
      args: argumentTypes(queryRoot.variableDefinitions, typeMap),
    }
  });

  let nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.fileName] = node;
  })

  for(var i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    if(!node.isFragment) {
      let fragmentComponents = new Set();

      findFragments(nodeMap, node.fileName, fragmentComponents);

      let codes = [node.code];
      let codecs = [node.codec];

      fragmentComponents.forEach(spread => {
        let {code, codec} = nodeMap[fragmentFileName(spread)]
        codes.push(code);
        codecs.push(codec);
      });

      node.code = codes.join('\n');
      node.codec = codecs.join('\n\n');
    }
  }

  return nodes;
}

function findFragments(nodeMap, currentFileName, resultSet) {
  let node = nodeMap[currentFileName];

  let re = /\.\.\.([A-Za-z0-9_]+)/g;

  let m;
  do {
    m = re.exec(node.code);
    if (m) {
      let name = fragmentFileName(m[1]);
      resultSet.add(name);
      findFragments(nodeMap, name, resultSet);
    }
  } while(m);
}

function fragmentFileName(fragmentName) {
  return fragmentName.split('_')[0]
}

exports.generateNodes = generateNodes;