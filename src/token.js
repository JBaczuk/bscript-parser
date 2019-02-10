const {
  wordForOpcode
} = require('./opcodes')

const Token = module.exports = class Token {
  constructor (type, value, startIndex, endIndex) {
    this.type = type
    this.value = value
    this.startIndex = startIndex
    this.endIndex = endIndex
  }

  static literal (value, startIndex, endIndex) {
    return new Token(Token.LITERAL, value, startIndex, endIndex)
  }

  static opcode (value, startIndex, endIndex) {
    return new Token(Token.OPCODE, value, startIndex, endIndex)
  }

  static placeholder (value, startIndex) {
    return new Token(Token.PLACEHOLDER, value, startIndex)
  }

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
    }
  }

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
    }
  }

  toString () {
    return this.toAsm()
  }
}

Token.LITERAL = 'LITERAL'
Token.OPCODE = 'OPCODE'
Token.PLACEHOLDER = 'PLACEHOLDER'
