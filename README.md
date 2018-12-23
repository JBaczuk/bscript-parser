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
> const bscript = require('bscript-parser')
undefined
> parsedScript = bscript.parseRawScript('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
'OP_HASH160 PUSHDATA(20)[c664139327b98043febeab6434eba89bb196d1af] OP_EQUAL'
```

The library also exposes several utility functions for getting information about bscript opcodes.

### Conversion between opcodes and asm terms
```
> bscript.opcodes.opcodeForWord('OP_EQUAL')
135
> bscript.opcodes.wordForOpcode(135)
'OP_EQUAL'
```

### Check if an opcode or asm term exists
```
> bscript.opcodes.opcodeIsValid(135)
true
> bscript.opcodes.opcodeIsValid(256)
false
> bscript.opcodes.wordIsValid('OP_EQUAL')
true
> bscript.opcodes.wordIsValid('OP_CLONE')
false
```

### Check if an opcode or asm term is disabled
```
> bscript.opcodes.opcodeIsDisabled(135)
false
> bscript.opcodes.opcodeIsDisabled(126)
true
> bscript.opcodes.wordIsDisabled('OP_EQUAL')
false
> bscript.opcodes.wordIsDisabled('OP_CAT')
true
```

### Retrieve descriptive information for an opcode or asm term

**Note:** The data is taken from the [bitcoin.it wiki](https://en.bitcoin.it/wiki/Script).

```
> bscript.opcodes.descriptionForOpcode(135)
'Returns 1 if the inputs are exactly equal, 0 otherwise.'
> bscript.opcodes.descriptionForWord('OP_HASH160')
'The input is hashed twice: first with SHA-256 and then with RIPEMD-160.'
> bscript.opcodes.inputDescriptionForOpcode(135)
'x1 x2'
> bscript.opcodes.inputDescriptionForWord('OP_HASH160')
'in'
> bscript.opcodes.outputDescriptionForOpcode(135)
'True / false'
> bscript.opcodes.outputDescriptionForWord('OP_HASH160')
'hash'
```
