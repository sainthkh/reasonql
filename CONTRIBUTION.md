# Contribution

Thank you for showing interests. Here are some tips for contribution.

## Install Dependencies. 

ReasonQL project uses Lerna with `--hoist` option. Because without it, some common libraries like reason-react can be duplicate and show warning messages. 

So, install dependencies with `lerna bootstrap` command. 

```
lerna bootstrap
```

## Project Structure

There are 3 project roots.

* examples: semi-"real world" examples like todomvc, Apollo Official example with ReasonQL. Currently, the folder is empty. 
* packages: tools for publication. Currently, there are only 2 of them: `core` and `compiler`. 
* snippets: sample codes for use cases like auth, enum, fragments, mutation, etc. Intentionally ignored CSS because I want users to focus on ReasonQL and ReasonReact. 

## Compiler Structure

Most of the heavy works are done in compiler. So, in most cases, you'll fixing codes in `packages/compiler`. 

Entry point is `cli.js`.

The code is compiled in  steps. 

* Load server schema and generate ast. You can see the ast [here](https://astexplorer.net/). (`loadServerSchema` in `compiler.js`)
* extract type and necessary data from ast. And generate map of types(`createTypeMap` in `type.js`).
* create nodes (an object with necessary information to generate types and codec) (`generateNodes` in `node.js`)
* generate real ReasonML codes based on node data. (`generateReasonCode` in `reason.js`)

Enums and errors skip node phase because they're less complicated. 