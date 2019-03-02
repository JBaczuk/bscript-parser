const bs58check = require('bs58check')
const bech32lib = require('bech32')

const Token = require('./token')
const Options = require('./options')

const parseScript = require('./parseScript')
const parseAsm = require('./parseAsm')
const {
  matchScriptType,
  executeTemplate,
  p2sh: p2shTemplate,
  p2pkh: p2pkhTemplate
} = require('./templates')

function byteToBuffer (byte) {
  const buf = Buffer.alloc(1)
  buf.writeUInt8(byte)
  return buf
}

const ADDRESS_SCRIPT_TYPES = [
  'p2pkh',
  'p2sh',
  'p2wsh',
  'p2wpkh'
]

/**
 * A BScript instance represents a parsed raw bscript or parsed bscript asm string.
 *
 * It is likely that you will not want to call the BScript constructor directly,
 * but instead use the `BScript.fromRaw`, `BScript.fromAsm` or `BScript.fromAddress`
 * static methods to create a new BScript instance.
 *
 * @param {Array<Token>} tokens - The ordered list of parsed tokens for the script
 * @example
 * const BScript = require('bscript-parser')
 * const {Token} = BScript
 * const {opcodeForWord} = Bscript.opcodes
 *
 * const tokens = [
 *   Token.opcode(opcodeForWord('OP_HASH160'), 0, 1),
 *   Token.literal(Buffer.from('c664139327b98043febeab6434eba89bb196d1af', 'hex'), 1, 21),
 *   Token.opcode(opcodeForWord('OP_EQUAL'), 21, 22)
 * ]
 *
 * const bscript = new BScript(tokens)
 */
class BScript {
  constructor (tokens) {
    /**
     * The script's parsed tokens.
     *
     * @type {Array<Token>}
     */
    this.tokens = tokens
  }

  /**
   * Converts a parsed script to an asm text.
   *
   * @param {Options} [options={}] - Options for asm stringification
   * @return {string} A bscript asm string.
   * @example
   * const bscript = BScript.fromRaw('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
   * const asm = bscript.toAsm()
   * assert.equal(asm, 'OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL')
   */
  toAsm (options = {}) {
    // convert to assembly
    options = Options(options)
    return this.tokens.map((token) => token.toAsm(options)).join(' ')
  }

  /**
   * Converts a parsed script to raw bscript.
   *
   * @param {null|string} outputEncoding - The buffer [encoding](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)
   *    of the returned raw bscript, or null (the default) to have a buffer returned.
   * @return {string|Buffer} The parsed script in its raw form
   * @example
   * const bscript = BScript.fromAsm('OP_HASH160 c664139327b98043febeab6434eba89bb196d1af OP_EQUAL')
   * const raw = bscript.toRaw('hex')
   * assert.equal(raw, 'a914c664139327b98043febeab6434eba89bb196d1af87')
   */
  toRaw (outputEncoding = null) {
    // convert to raw script
    const script = Buffer.concat(this.tokens.map((token) => token.toScript()))
    outputEncoding = Options.validateEncoding(outputEncoding)

    switch (outputEncoding) {
      case null:
        return script
      case 'hex':
      case 'base64':
        return script.toString(outputEncoding)
    }

    throw new Error(`Unsupported output encoding ${outputEncoding}`)
  }

  /**
   * Convert a BSCript object into an address.
   *
   * Either the `pubKeyHash`, `scriptHash`, or `bech32` option is used when
   * the address is generated, depending on the type of address the script
   * converts to.  See the *Bitcoin Wiki* entry for [addresses](https://en.bitcoin.it/wiki/Address)
   * to learn more about these options and what they mean.  If the address is intended
   * to be used on the bitcoin mainnet, you should use the default values.
   *
   * If the script does not represent an address, `undefined`is returned.
   *
   * @param {Options} [options={}] - Options for address generation
   * @return {string|undefined} The address for the script or `undefined` if the script
   *    does not convert to an address
   * @example
   * const bscript = BScript.fromAsm('OP_HASH160 52973f3519d5d248004767efb874aa2a3b2b37ce OP_EQUAL')
   * const address = bscript.toAddress()
   * assert.equal(address, '39DiX6M1KX2MNvtm44eUu18qdgqxnJgTW8')
   */
  toAddress (options = {}) {
    const scriptType = this.scriptType
    if (!ADDRESS_SCRIPT_TYPES.includes(this.scriptType)) {
      return undefined
    }

    options = Options(options)

    switch (scriptType) {
      case 'p2pkh': {
        const {
          pubKeyHash
        } = options

        return bs58check.encode(Buffer.concat([byteToBuffer(pubKeyHash), this.tokens[2].value]))
      }
      case 'p2sh': {
        const {
          scriptHash
        } = options

        return bs58check.encode(Buffer.concat([byteToBuffer(scriptHash), this.tokens[1].value]))
      }
      case 'p2wsh':
      case 'p2wpkh': {
        const {
          bech32
        } = options

        return bech32lib.encode(bech32, bech32lib.toWords(this.toRaw()))
      }
    }
  }

  /**
   * Create a BScript object from a raw script.
   *
   * @param {string|Buffer} rawScript - The raw bscript to parse into a BScript object
   * @param {string} [encoding='hex'] - The buffer [encoding](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)
   *    of the raw script if it is a string. Defaults to 'hex'.
   * @return {BScript} The parsed script object.
   * @throws {TypeError} When `rawScript` is not a buffer or not a properly encoded string.
   * @throws {Error} When the script contains an invalid opcode.
   * @example
   * const raw = a914c664139327b98043febeab6434eba89bb196d1af87
   * const bscript = BScript.fromRaw(raw, 'hex')
   * assert.equal(raw, bscript.toRaw('hex'))
   */
  static fromRaw (rawScript, encoding = 'hex') {
    encoding = Options.validateEncoding(encoding)
    if (typeof rawScript === 'string') {
      rawScript = Buffer.from(rawScript, encoding)
    }

    if (!(rawScript instanceof Buffer)) {
      throw new TypeError('Raw script must be a string or buffer')
    }

    const tokens = parseScript(rawScript)
    return new BScript(tokens)
  }

  /**
   * Create a BScript object from an asm string.
   *
   * @param {string} asmScript - The bscript asm string to parse into a BScript object
   * @param {Options} [options={}] - Options to be passed to the parser
   * @return {BScript} The parsed script object.
   * @throws {Error} When `asmScript` is not a valid asm script.
   * @example
   * const asm = 'OP_HASH160 52973f3519d5d248004767efb874aa2a3b2b37ce OP_EQUAL'
   * const bscript = BScript.fromAsm(asm)
   * assert.equal(asm, bscript.toAsm())
   */
  static fromAsm (asmScript, options = {}) {
    if (typeof asmScript !== 'string') {
      throw new TypeError('Assembly must be a string')
    }

    options = Options(options)

    const tokens = parseAsm(asmScript, options)
    return new BScript(tokens)
  }

  /**
   * Create a BScript object from a [standard address](https://en.bitcoin.it/wiki/Address).
   *
   * Depending on the type of address provided, one of the `pubKeyHash`,
   * `scriptHash`, or `bech32` option is used when the address is parsed.
   * See the *Bitcoin Wiki* entry for [addresses](https://en.bitcoin.it/wiki/Address)
   * to learn more about these options and what they mean.  If the address is one for
   * the bitcoin mainnet, you should use the default values.
   *
   * @param {string} address - The address being parsed into a script object.
   * @param {Options} options - The options used for parsing the address.
   * @returns {BSCript} The parsed script object.
   * @throws {TypeError} When `address` is not a known standard address.
   * @example
   * [
   *   '1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs',
   *   '39DiX6M1KX2MNvtm44eUu18qdgqxnJgTW8',
   *   'bc1qq28dxlfuvrp8666vlh73tsrspg8n68atkfqxqwfjl',
   *   'bc1qqsgucp6ev42uvcw9lnhjyhkz2vhyv9ez4pg003dcerw6ds4nw7q25ssrrlcc'
   * ].forEach((address) => {
   *   bscript = BScript.fromAddress(address)
   *   assert.equal(address, bscript.toAddress())
   * })
   */
  static fromAddress (address, options = {}) {
    options = Options(options)

    const {
      pubKeyHash,
      scriptHash,
      bech32
    } = options

    if (address.startsWith(bech32)) {
      try {
        const { words, prefix } = bech32lib.decode(address)
        if (prefix === bech32) {
          return BScript.fromRaw(Buffer.from(bech32lib.fromWords(words)))
        }
      } catch (e) {
        // ignore
      }
    }

    try {
      let bytes = bs58check.decode(address)
      if (bytes.readUInt8(0) === pubKeyHash) {
        // p2pkh
        const tokens = executeTemplate(p2pkhTemplate, [bytes.slice(1)])
        return new BScript(tokens)
      } else if (bytes.readUInt8(0) === scriptHash) {
        // p2sh
        const tokens = executeTemplate(p2shTemplate, [bytes.slice(1)])
        return new BScript(tokens)
      }
    } catch (e) {
      // ignore
    }

    throw TypeError(`Could not convert ${address} to a script`)
  }

  /**
   * The script type of the script.
   *
   * Possible values are:
   *
   * - p2pk
   * - p2pkh
   * - p2sh
   * - p2wpkh
   * - p2wsh
   *
   * If the script is not a known standard script type, `undefined` is returned.
   *
   * @type {string|undefined}
   * @example
   * const asm = 'OP_DUP OP_HASH160 f54a5851e9372b87810a8e60cdd2e7cfd80b6e31 OP_EQUALVERIFY OP_CHECKSIG'
   * const bscript = BScript.fromAsm(asm)
   * assert.equal('p2pkh', bscript.scriptType)
   *
   */
  get scriptType () {
    return matchScriptType(this.tokens)
  }

  /**
   * Whether or not the script is convertible to an address.
   *
   * @type {boolean}
   * @example
   * const asm = 'OP_0 769be9e30613eb5a67efe8ae03805079e8fd5d92'
   * const bscript = BScript.fromAsm(asm)
   * assert.equal(true, bscript.hasAddress)
   * @example
   * const asm = 'OP_RETURN 636861726c6579206c6f766573206865696469'
   * const bscript = BScript.fromAsm(asm)
   * assert.equal(false, bscript.hasAddress)
   */
  get hasAddress () {
    return ADDRESS_SCRIPT_TYPES.includes(this.scriptType)
  }

  /**
   * The redeem script of a p2sh scriptSig.
   *
   * @type {BScript|undefined}
   * @example
   * const bscript = BScript.fromRaw('160014983c113b3b34d109e72aa6d4246e2430b3240161', 'hex')
   * const redeem = bscript.redeemScript
   * assert.equal(redeem.toRaw('hex'), '0014983c113b3b34d109e72aa6d4246e2430b3240161')
   */
  get redeemScript () {
    if (this.tokens.length === 1 && this.tokens[0].type === Token.LITERAL) {
      let redeemTokens
      try {
        redeemTokens = parseScript(this.tokens[0].value)
      } catch (e) {
        return undefined
      }

      return new BScript(redeemTokens)
    }

    // return undefined by default
  }
}

module.exports = BScript
