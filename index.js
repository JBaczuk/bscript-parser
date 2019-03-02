const deprecate = require('depd')('bscript-parser')

const opcodes = require('./src/opcodes')
const Token = require('./src/token')
const BScript = require('./src/bscript')

/**
 * Convert raw bscript into a bscript asm string.
 *
 * @static
 * @param {string|Buffer} rawScript - The raw bscript
 * @param {string|null|Options} [optionsOrEncoding={}] - An Options object, or just the `encoding` option as a string
 * @return {string} The raw bscript converted to an asm string
 *
 * @example
 * const {rawToAsm} = require('bscript-parser')
 * const asm = rawToAsm('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
 * assert.equal(asm, 'OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL')
 */
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

/**
 * Convert raw bscript into an address.
 *
 * @static
 * @param {string|Buffer} rawScript - The raw bscript
 * @param {string|null|Options} [optionsOrEncoding={}] - An Options object, or just the `encoding` option as a string
 * @return {string} The raw bscript converted to an address
 *
 * @example
 * const {rawToAddress} = require('bscript-parser')
 * const address = rawToAddress('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
 * assert.equal(address, '3Kn1bxgQwwqfCQCLtfErFFdqQLydN5t8ez')
 */
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

/**
 * Convert a bscript asm string into raw bscript.
 *
 * @static
 * @param {string} asmScript - The bscript asm string
 * @param {string|null|Options} [optionsOrEncoding={}] - An Options object or just the encoding option
 * @return {string|Buffer} The asm string converted to raw bscript
 *
 * @example
 * const {asmToRaw} = require('bscript-parser')
 * const raw = asmToRaw('OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL', 'hex')
 * assert.equal(raw, 'a914c664139327b98043febeab6434eba89bb196d1af87')
 */
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

/**
 * Convert a bscript asm string into an address.
 *
 * @static
 * @param {string} asmScript - The bscript asm string
 * @param {Options} [options={}] - An Options object
 * @return {string} The asm string converted to an address
 *
 * @example
 * const {asmToAddress} = require('bscript-parser')
 * const address = asmToAddress('OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL')
 * assert.equal(address, '3Kn1bxgQwwqfCQCLtfErFFdqQLydN5t8ez')
 */
BScript.asmToAddress = function (asmScript, options = {}) {
  return BScript.fromAsm(asmScript, options).toAddress(options)
}

/**
 * Convert an address string into raw bscript.
 *
 * @static
 * @param {string} address - The address
 * @param {string|null|Options} [optionsOrEncoding={}] - An Options object or just the encoding option
 * @return {string|Buffer} The address converted to raw bscript
 *
 * @example
 * const {addressToRaw} = require('bscript-parser')
 * const raw = addressToRaw('3Kn1bxgQwwqfCQCLtfErFFdqQLydN5t8ez', 'hex')
 * assert.equal(raw, 'a914c664139327b98043febeab6434eba89bb196d1af87')
 */
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

/**
 * Convert an address into a bscript asm string.
 *
 * @static
 * @param {string} address - The address
 * @param {Options} [options={}] - An Options object
 * @return {string} The address converted to an asm string
 *
 * @example
 * const {addressToAsm} = require('bscript-parser')
 * const asm = addressToAsm('3Kn1bxgQwwqfCQCLtfErFFdqQLydN5t8ez')
 * assert.equal(asm, 'OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL')
 */
BScript.addressToAsm = function (address, options = {}) {
  return BScript.fromAddress(address, options).toAsm(options)
}

/**
 * Reformat a bscript asm string.
 *
 * @static
 * @param {string} asmScript - The bscript asm string
 * @param {Options} [options={}] - The options for the reformatted code
 * @return {string} The reformatted asm script.
 *
 * @example
 * const {formatAsm} = require('bscript-parser')
 * const formatted = formatAsm('HASH160  [c664139327b98043febeab6434eba89bb196d1af]\nOP_EQUAL')
 * assert.equal(asm, 'OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL')
 */
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
