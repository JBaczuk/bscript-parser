const opcodes = require('./src/opcodes')
const BScript = require('./src/bscript')

// to be deprecated
BScript.parseRawScript = function (rawScript, encoding = 'hex') {
  return BScript.fromRaw(rawScript, encoding).toAsm()
}

// to be deprecated
BScript.parseAsmScript = function (asmScript, outputEncoding = null) {
  return BScript.fromAsm(asmScript).toRaw(outputEncoding)
}

BScript.opcodes = opcodes

module.exports = BScript
