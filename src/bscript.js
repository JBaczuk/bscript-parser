const bs58check = require('bs58check')
const bech32lib = require('bech32')

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

const PUBKEY_HASH = 0x00
const SCRIPT_HASH = 0x05
const BECH32 = 'bc'

class BScript {
  constructor (tokens) {
    this.tokens = tokens
  }

  toAsm (options = {}) {
    // convert to assembly
    return this.tokens.map((token) => token.toAsm(options)).join(' ')
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

  toAddress (options = {}) {
    const scriptType = this.scriptType
    if (!ADDRESS_SCRIPT_TYPES.includes(this.scriptType)) {
      return undefined
    }

    switch (scriptType) {
      case 'p2pkh': {
        const {
          pubKeyHash = PUBKEY_HASH
        } = options

        return bs58check.encode(Buffer.concat([byteToBuffer(pubKeyHash), this.tokens[2].value]))
      }
      case 'p2sh': {
        const {
          scriptHash = SCRIPT_HASH
        } = options

        return bs58check.encode(Buffer.concat([byteToBuffer(scriptHash), this.tokens[1].value]))
      }
      case 'p2wsh':
      case 'p2wpkh': {
        const {
          bech32 = BECH32
        } = options

        return bech32lib.encode(bech32, bech32lib.toWords(this.toRaw()))
      }
    }
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

  static fromAsm (asmScript, options = {}) {
    if (typeof asmScript !== 'string') {
      throw new TypeError('Assembly must be a string')
    }

    const tokens = parseAsm(asmScript, options)
    return new BScript(tokens)
  }

  static fromAddress (address, options = {}) {
    const {
      pubKeyHash = PUBKEY_HASH,
      scriptHash = SCRIPT_HASH,
      bech32 = BECH32
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

  get scriptType () {
    return matchScriptType(this.tokens)
  }

  get hasAddress () {
    return ADDRESS_SCRIPT_TYPES.includes(this.scriptType)
  }
}

module.exports = BScript
