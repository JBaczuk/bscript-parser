const PUBKEY_HASH = 0x00
const SCRIPT_HASH = 0x05
const BECH32 = 'bc'

const VALID_ENCODINGS = new Set([
  null,
  'hex',
  'base64'
])

const VALID_LITERAL_STYLES = new Set([
  'normal',
  'brackets',
  'prefixed',
  'verbose'
])

const VALID_OPCODE_STYLES = new Set([
  'normal',
  'short'
])

function Options (data = {}) {
  if (data == null || typeof data !== 'object') {
    throw new TypeError('Options must be an object')
  }

  const {
    encoding = 'hex',
    literalStyle = 'normal',
    opcodeStyle = 'normal',
    terms = {},
    opcodes = {},
    pubKeyHash = PUBKEY_HASH,
    scriptHash = SCRIPT_HASH,
    bech32 = BECH32,
    allowPlaceHolders = false
  } = data

  return {
    encoding: Options.validateEncoding(encoding),
    literalStyle: Options.validateLiteralStyle(literalStyle),
    opcodeStyle: Options.validateOpcodeStyle(opcodeStyle),
    terms,
    opcodes,
    pubKeyHash,
    scriptHash,
    bech32,
    allowPlaceHolders,
    __proto__: Options.prototype
  }
}

Options.validateEncoding = function validateEncoding (encoding) {
  if (!VALID_ENCODINGS.has(encoding)) {
    throw new TypeError('Encoding must be one of null, "hex" or "base64"')
  }

  return encoding
}

Options.validateLiteralStyle = function validateLiteralStyle (literalStyle) {
  if (!VALID_LITERAL_STYLES.has(literalStyle)) {
    throw new TypeError('Literal style must be one of "normal", "brackets", "prefixed" or "verbose"')
  }

  return literalStyle
}

Options.validateOpcodeStyle = function validateOpcodeStyle (opcodeStyle) {
  if (!VALID_OPCODE_STYLES.has(opcodeStyle)) {
    throw new TypeError('Opcode style must be one of "normal" or "short"')
  }

  return opcodeStyle
}

module.exports = Options

/**
 * Options shared by several of the functions provided by this module.
 *
 * @typedef {Object} Options
 * @property {string} [encoding='hex'] -
 *    The buffer [encoding](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)
 *    of the input or output raw bscript if it is a string.
 *    A value of `null` will output a raw bscript as a Buffer.
 *    The default value is `'hex'`.
 * @property {string} [literalStyle='normal'] -
 *    When generating asm, this setting configures the style in which `PUSH_DATA` values ar output.
 *    The following options are allowed:<dl>
 *    <dt>normal</dt><dd>abcdef012345</dd>
 *    <dt>brackets</dt><dd>[abcdef012345]</dd>
 *    <dt>prefixed</dt><dd>0xabcdef012345</dd>
 *    <dt>verbose</dt><dd>PUSHDATA(6)[abcdef012345]</dd></dl>
 * @property {string} [opcodeStyle='normal'] -
 *    When generating asm, this setting configures the style in which opcode terms are output.
 *    The following options are allowed:<dl>
 *    <dt>normal</dt><dd>OP_HASH160</dd>
 *    <dt>short</dt><dd>HASH160</dd></dl>
 * @property {Object} [terms] - An object mapping terms to opcodes.
 *    This allows terms to be overridden and for non-standard terms to be parsed.
 * @property {Object} [opcodes] - An object mapping opcodes to terms.
 *    This allows opcodes to be overriden with non-standard terms.
 * @property {number} [pubKeyHash=0x00] - The pub key hash prefix for generating / parsing standard [p2pkh](https://en.bitcoin.it/wiki/Transaction#Pay-to-PubkeyHash) addresses.
 * @property {number} [scriptHash=0x05] - The script hash prefix for generating / parsing standard [p2sh](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) addresses.
 * @property {string} [bech32='bc'] - The prefix used for generating / parsing standard [bech32](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki) addresses.
 * @property {boolean} [allowPlaceHolders=false] - When true, an asm script can be compiled with `<placeholder>` values. The default is `false`.
 *
 * @example
 * // These are all the default options
 * const options = {
 *   encoding: 'hex',
 *   literalStyle: 'normal',
 *   opcodeStyle: 'normal',
 *   terms: {},
 *   opcodes: {},
 *   pubKeyHash: 0x00,
 *   scriptHash: 0x05,
 *   bech32: 'bc',
 *   allowPlaceHolders: false
 * }
 */
