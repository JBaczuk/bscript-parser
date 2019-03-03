const {
  wordForOpcode
} = require('./opcodes')

/**
 * A Token represents a parsed part of a bscript.
 *
 * There are three types of tokens:
 *
 * - A literal (PUSH_DATA data)
 * - An opcode
 * - A placeholder (for template scripts only)
 *
 * @param {string} type - One of `Token.LITERAL`, `Token.OPCODE`, or `Token.PLACEHOLDER`
 * @param {Buffer|number|string} value - The value of the token.
 *    For a literal, this is the raw pushed data as a Buffer (without the push data opcode).
 *    For an opcode, this is the opcode as an integer.
 *    For a placeholder, it is  the placeholder string.
 * @param {number} startIndex - The position within the asm text or raw script where the
 *    token beings. Note: if source of the script is a raw script that is string encoded,
 *    the startIndex is the index within the buffer, not the original encoded string.
 * @param {number} endIndex - The position within the asm text or raw script where the
 *    token ends. Note: if source of the script is a raw script that is string encoded,
 *    the endIndex is the index within the buffer, not the original encoded string.
 * @example
 * const {Token} = require('bscript-parser')
 * token = new Token(Token.LITERAL, Buffer.from('abcdef0123', 'hex'), 0, 10)
 */
class Token {
  constructor (type, value, startIndex, endIndex) {
    /**
     * The token's type
     *
     * @type {string}
     */
    this.type = type

    /**
     * The token's value
     *
     * @type {Buffer|number|string}
     */
    this.value = value

    /**
     * The token's start position in the source script (if applicable)
     *
     * @type {number}
     */
    this.startIndex = startIndex

    /**
     * The token's end position in the source script (if applicable)
     *
     * @type {number}
     */
    this.endIndex = endIndex
  }

  /**
   * A short-hand helper to create a `Token.LITERAL` token.
   *
   * @param {Buffer} value - The push data value. See the parameters for [Token](#token).
   * @param {number} startIndex - See the parameters for [Token](#token)
   * @param {number} endIndex - See the parameters for [Token](#token)
   * @return {Token}
   */
  static literal (value, startIndex, endIndex) {
    return new Token(Token.LITERAL, value, startIndex, endIndex)
  }

  /**
   * A short-hand helper to create a `Token.OPCODE` token.
   *
   * @param {integer} value - The opcode value. See the parameters for [Token](#token).
   * @param {number} startIndex - See the parameters for [Token](#token)
   * @param {number} endIndex - See the parameters for [Token](#token)
   * @return {Token}
   */
  static opcode (value, startIndex, endIndex) {
    return new Token(Token.OPCODE, value, startIndex, endIndex)
  }

  /**
   * A short-hand helper to create a `Token.PLACEHOLDER` token.
   *
   * @param {string} value - The placeholder string. See the parameters for [Token](#token).
   * @param {number} startIndex - See the parameters for [Token](#token)
   * @param {number} endIndex - See the parameters for [Token](#token)
   * @return {Token}
   */
  static placeholder (value, startIndex, endIndex) {
    return new Token(Token.PLACEHOLDER, value, startIndex, endIndex)
  }

  /**
   * A short-hand helper to create a `Token.REPEAT` token.
   *
   * @param {number} startIndex - See the parameters for [Token](#token)
   * @param {number} endIndex - See the parameters for [Token](#token)
   * @return {Token}
   */
  static repeat (startIndex, endIndex) {
    return new Token(Token.REPEAT, null, startIndex, endIndex)
  }

  /**
   * Convert a token into an asm string.
   *
   * @param {Options} options - Options for asm stringification.
   *    The `literalStyle`, and `opcodeStyle` parameters are relevant to this method.
   * @return {string} The token's asm representation.
   * @example
   * const token = Token.literal(Buffer.from('c664139327b98043febeab6434eba89bb196d1af', 'hex'))
   * const asm = token.toAsm({literalStyle: 'verbose'})
   * assert.equal('PUSH_DATA(20)[c664139327b98043febeab6434eba89bb196d1af]', asm)
   * @example
   * const token = Token.opcode(0xa9)
   * const asm = token.toAsm({opcodeStyle: 'short'})
   * assert.equal('HASH160', asm)
   */
  toAsm (options = {}) {
    if (this.type === Token.LITERAL) {
      const {
        literalStyle = 'normal'
      } = options

      switch (literalStyle) {
        case 'normal':
        default:
          if (this.value.length === 0) {
            return '0'
          }
          return this.value.toString('hex')
        case 'brackets':
          return `[${this.value.toString('hex')}]`
        case 'prefixed':
          if (this.value.length === 0) {
            return '0'
          }
          return `0x${this.value.toString('hex')}`
        case 'verbose':
          return `PUSHDATA(${this.value.length})[${this.value.toString('hex')}]`
      }
    } else if (this.type === Token.OPCODE) {
      const {
        opcodeStyle = 'normal',
        opcodes = {}
      } = options

      if (typeof opcodes[this.value] === 'string') {
        return opcodes[this.value]
      }

      const term = wordForOpcode(this.value)
      switch (opcodeStyle) {
        case 'normal':
        default:
          return term
        case 'short':
          return term.substr(3)
      }
    } else if (this.type === Token.PLACEHOLDER) {
      return `<${this.value}>`
    } else if (this.type === Token.REPEAT) {
      return `...`
    }
  }

  /**
   * Convert a token into its raw script representation.
   *
   * @return {Buffer} The token's raw bscript representation.
   * @example
   * const data = Buffer.from('c664139327b98043febeab6434eba89bb196d1af', 'hex')
   * const expected = Buffer.from('14c664139327b98043febeab6434eba89bb196d1af', 'hex')
   * const token = Token.literal(data)
   * const raw = token.toScript()
   * assert.equal(0, expected.compare(raw))
   * @example
   * const token = Token.opcode(0xa9)
   * const expexted = Buffer.from([0xa9])
   * const raw = token.toScript()
   * assert.equal(0, expected.compare(raw))
   */
  toScript () {
    if (this.type === Token.LITERAL) {
      if (this.value.length < 76) {
        const buf = Buffer.alloc(this.value.length + 1)
        buf.writeUInt8(this.value.length)
        this.value.copy(buf, 1)
        return buf
      } else if (this.value.length < 2 ** 8) {
        const buf = Buffer.alloc(this.value.length + 2)
        buf.writeUInt8(76)
        buf.writeUInt8(this.value.length, 1)
        this.value.copy(buf, 2)
        return buf
      } else if (this.value.length < 2 ** 16) {
        const buf = Buffer.alloc(this.value.length + 3)
        buf.writeUInt8(77)
        buf.writeUInt16LE(this.value.length, 1)
        this.value.copy(buf, 3)
        return buf
      } else if (this.value.length < 2 ** 32) {
        const buf = Buffer.alloc(this.value.length + 5)
        buf.writeUInt8(78)
        buf.writeUInt32LE(this.value.length, 1)
        this.value.copy(buf, 5)
        return buf
      } else {
        throw new Error('Token\'s value is too large')
      }
    } else if (this.type === Token.OPCODE) {
      const buf = Buffer.alloc(1)
      buf.writeUInt8(this.value)
      return buf
    } else if (this.type === Token.PLACEHOLDER) {
      // Return an OP_0 for a placeholder
      return Buffer.from('00', 'hex')
    } else if (this.type === Token.REPEAT) {
      // Return an empty buffer for a repeat
      return Buffer.from('', 'hex')
    }
  }

  /**
   * Convert to an asm string.
   *
   * @return {string}
   */
  toString () {
    return this.toAsm()
  }
}

/**
 * Constant for the `type` property of a literal token.
 *
 * @type {string}
 */
Token.LITERAL = 'LITERAL'

/**
 * Constant for the `type` property of an opcode token.
 *
 * @type {string}
 */
Token.OPCODE = 'OPCODE'

/**
 * Constant for the `type` property of a placeholder token.
 *
 * This token is only used when `allowPlaceHolder` is `true`.
 *
 * @type {string}
 */
Token.PLACEHOLDER = 'PLACEHOLDER'

/**
 * Constant for the `type` property of a repeat token.
 *
 * This token is only used when `allowPlaceHolder` is `true`.
 *
 * @type {string}
 */
Token.REPEAT = 'REPEAT'

module.exports = Token
