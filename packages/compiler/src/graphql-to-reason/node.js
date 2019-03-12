const {parse} = require('graphql');
const {makeTypeList, argumentTypes} = require('./type');
const {generateCodec} = require('./codec');

function generateNodes(gqlCodes, typeMap) {
  let nodes = gqlCodes.map(code => {
    let ast = parse(code.template);
    let queryRoot = ast.definitions[0];
    let isFragment = queryRoot.kind == "FragmentDefinition";
    let name = ast.definitions[0].name.value
    let fileName = isFragment
      ? fragmentFileName(name)
      : name;
    let typeList = makeTypeList(queryRoot, isFragment, typeMap);

    return {
      code: code.template.trim(),
      ast,
      isFragment,
      fileName,
      typeList,
      codec: generateCodec(typeList, isFragment, fileName),
      args: argumentTypes(queryRoot.variableDefinitions),
    }
  });

  let nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.fileName] = node;
  })

  for(var i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    let re = /\.\.\.([A-Za-z0-9_]+)/g;
    let fragmentComponents = new Set();

    let m;
    do {
      m = re.exec(node.code);
      if (m) {
        let name = fragmentFileName(m[1]);
        fragmentComponents.add(name);
      }
    } while(m);
    
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

  return nodes;
}

function fragmentFileName(fragmentName) {
  return fragmentName.split('_')[0]
}

exports.generateNodes = generateNodes;