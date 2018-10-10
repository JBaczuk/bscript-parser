# Node Bitcoin Script
[![NPM](https://img.shields.io/npm/v/bscript-parser.svg)](https://www.npmjs.org/package/bscript-parser)  
Node Bitcoin script parser

## Installation
```
$ npm i bscript-parser --save
```

## Usage
You can parse raw hex string into an assembly string using:  
```
> const nbs = require('bscript-parser')
undefined
> parsedScript = nbs.parseRawScript('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
'OP_HASH160 PUSHDATA(20)[c664139327b98043febeab6434eba89bb196d1af] OP_EQUAL'
```
