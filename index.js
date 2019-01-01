const opcodes = require('./src/opcodes')
const BScript = require('./src/bscript')

BScript.rawToAsm = function (rawScript, encoding = 'hex') {
  return BScript.fromRaw(rawScript, encoding).toAsm()
}

BScript.asmToRaw = function (asmScript, outputEncoding = null) {
  return BScript.fromAsm(asmScript).toRaw(outputEncoding)
}

BScript.formatAsm = function (asmScript) {
  return BScript.fromAsm(asmScript).toAsm()
}

// to be deprecated
BScript.parseRawScript = BScript.rawToAsm
BScript.parseAsmScript = BScript.asmToRaw

BScript.opcodes = opcodes

module.exports = BScript
