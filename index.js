const deprecate = require('depd')('bscript-parser')

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

BScript.parseRawScript = deprecate.function(
  BScript.rawToAsm,
  'BScript.parseRawScript is deprecated and will be removed in a future version. ' +
  'Please use BScript.rawToAsm instead.'
)

BScript.parseAsmScript = deprecate.function(
  BScript.asmToRaw,
  'BScript.parseAsmScript is deprecated and will be removed in a future version. ' +
  'Please use BScript.asmToRaw instead.'
)

BScript.opcodes = opcodes

module.exports = BScript
