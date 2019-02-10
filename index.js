const opcodes = require('./src/opcodes')
const BScript = require('./src/bscript')

BScript.rawToAsm = function (rawScript, optionsOrEncoding = {}) {
  let options = optionsOrEncoding

  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const {
    encoding = 'hex'
  } = options

  return BScript.fromRaw(rawScript, encoding).toAsm(options)
}

BScript.asmToRaw = function (asmScript, optionsOrEncoding = {}) {
  let options = optionsOrEncoding

  if (options == null || typeof options === 'string') {
    options = { encoding: options }
  }

  const {
    encoding = 'hex'
  } = options

  return BScript.fromAsm(asmScript, options).toRaw(encoding)
}

BScript.formatAsm = function (asmScript, options = {}) {
  return BScript.fromAsm(asmScript, options).toAsm(options)
}

// to be deprecated
BScript.parseRawScript = BScript.rawToAsm
BScript.parseAsmScript = BScript.asmToRaw

BScript.opcodes = opcodes

module.exports = BScript
