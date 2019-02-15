const deprecate = require('depd')('bscript-parser')

const opcodes = require('./src/opcodes')
const Token = require('./src/token')
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

BScript.rawToAddress = function (rawScript, optionsOrEncoding = {}) {
  let options = optionsOrEncoding

  if (typeof options === 'string') {
    options = { encoding: options }
  }

  const {
    encoding = 'hex'
  } = options

  return BScript.fromRaw(rawScript, encoding).toAddress(options)
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

BScript.asmToAddress = function (asmScript, options = {}) {
  return BScript.fromAsm(asmScript, options).toAddress(options)
}

BScript.addressToRaw = function (address, optionsOrEncoding = {}) {
  let options = optionsOrEncoding

  if (options == null || typeof options === 'string') {
    options = { encoding: options }
  }

  const {
    encoding = 'hex'
  } = options

  return BScript.fromAddress(address, options).toRaw(encoding)
}

BScript.addressToAsm = function (address, options = {}) {
  return BScript.fromAddress(address, options).toAsm(options)
}

BScript.formatAsm = function (asmScript, options = {}) {
  return BScript.fromAsm(asmScript, options).toAsm(options)
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
BScript.Token = Token

module.exports = BScript
