const parseScript = require('./parseScript')
const parseAsm = require('./parseAsm')
const { matchScriptType } = require('./templates')

class BScript {
  constructor (tokens) {
    this.tokens = tokens
  }

  toAsm () {
    // convert to assembly
    return this.tokens.map((token) => token.toAsm()).join(' ')
  }

  toRaw (outputEncoding = null) {
    // convert to raw script
    const script = Buffer.concat(this.tokens.map((token) => token.toScript()))

    switch (outputEncoding) {
      case null:
        return script
      case 'hex':
      case 'base64':
        return script.toString(outputEncoding)
    }

    throw new Error(`Unsupported output encoding ${outputEncoding}`)
  }

  static fromRaw (rawScript, encoding = 'hex') {
    if (typeof rawScript === 'string') {
      rawScript = Buffer.from(rawScript, encoding)
    }

    if (!(rawScript instanceof Buffer)) {
      throw new TypeError('Raw script must be a string or buffer')
    }

    const tokens = parseScript(rawScript)
    return new BScript(tokens)
  }

  static fromAsm (asmScript) {
    if (typeof asmScript !== 'string') {
      throw new TypeError('Assembly must be a string')
    }

    const tokens = parseAsm(asmScript)
    return new BScript(tokens)
  }

  get scriptType () {
    return matchScriptType(this.tokens)
  }
}

module.exports = BScript
