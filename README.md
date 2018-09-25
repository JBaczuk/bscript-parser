# Node Bitcoin Script
[![NPM](https://img.shields.io/npm/v/node-bitcoin-script.svg)](https://www.npmjs.org/package/node-bitcoin-script)  
Node Bitcoin script parser

## Installation
```
$ npm i node-bitcoin-script --save
```

## Usage
You can parse raw hex string into an assembly string using:  
```
> const nbs = require('node-bitcoin-script')
undefined
> parsedScript = nbs.parseRawScript('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
'OP_HASH160 PUSHDATA(20)[c664139327b98043febeab6434eba89bb196d1af] OP_EQUAL'
```
