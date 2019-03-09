const parseAsm = require('./parseAsm')
const Token = require('./token')
const {
  opcodeForWord
} = require('./opcodes')

const parseOpts = { allowPlaceHolder: true }

const p2pk = parseAsm('<65-byte-pubkey> OP_CHECKSIG', parseOpts)
const p2pkh = parseAsm('OP_DUP OP_HASH160 <20-byte-pubkey-hash> OP_EQUALVERIFY OP_CHECKSIG', parseOpts)
const p2sh = parseAsm('OP_HASH160 <20-byte-script-hash> OP_EQUAL', parseOpts)
const p2wpkh = parseAsm('0 <20-byte-pubkey-hash>', parseOpts)
const p2wsh = parseAsm('0 <32-byte-hash>', parseOpts)
const p2ms = parseAsm('<OP_1-OP_16> <65-byte-pubkey> ... <OP_1-OP_16> OP_CHECKMULTISIG', parseOpts)

const templates = {
  p2pk,
  p2pkh,
  p2sh,
  p2wpkh,
  p2wsh,
  p2ms
}

function tokenMatches (t1, t2) {
  if (t2.type === Token.OPCODE) {
    if (t1.type !== Token.OPCODE || t1.value !== t2.value) {
      return false
    }
  } else if (t2.type === Token.PLACEHOLDER) {
    if (/^OP_/.test(t2.value)) {
      // opcode placeholder
      if (t1.type !== Token.OPCODE) {
        return false
      }

      let [lowOp, highOp] = t2.value.split('-')
      if (highOp == null) {
        highOp = lowOp
      }

      [lowOp, highOp] = [opcodeForWord(lowOp), opcodeForWord(highOp)]

      if (t1.value < lowOp || t1.value > highOp) {
        return false
      }
    } else if (t1.type !== Token.LITERAL) {
      return false
    } else if (/^[0-9]+-byte/.test(t2.value)) {
      const expectedSize = parseInt(t2.value)
      if (t1.value.length !== expectedSize) {
        return false
      }
    }
  } else if (t2.type === Token.LITERAL) {
    if (t1.type !== Token.LITERAL || t1.value.compare(t2.value) !== 0) {
      return false
    }
  }

  return true
}

function scriptTypeMatches (tokens, template) {
  let i1 = 0
  let i2 = 0

  while (tokens[i1] != null && template[i2] != null) {
    let t1 = tokens[i1]
    let t2 = template[i2]

    if (t2.type === Token.REPEAT) {
      t2 = template[i2 - 1]
      if (t2 == null) {
        throw Error('A template must not have a repeat as a first token')
      }

      while (tokenMatches(t1, t2)) {
        i1 += 1
        t1 = tokens[i1]
      }

      i2 += 1

      continue
    }

    if (!tokenMatches(t1, t2)) {
      return false
    }

    i1 += 1
    i2 += 1
  }

  return tokens[i1] == null && template[i2] == null
}

function matchScriptType (tokens) {
  return Object.keys(templates).find((key) => {
    return scriptTypeMatches(tokens, templates[key])
  })
}

function executeTemplate (template, values) {
  let valuesIdx = 0
  const tokens = template.map((token) => {
    if (token.type === Token.PLACEHOLDER) {
      const value = values[valuesIdx]
      if (!(value instanceof Buffer)) {
        throw new TypeError(`Provided value at index ${valuesIdx} must be a buffer`)
      }
      valuesIdx += 1
      return Token.literal(value.slice(), null)
    }

    return token
  })

  if (valuesIdx !== values.length) {
    throw new RangeError(`Too many values provided to template`)
  }

  return tokens
}

Object.assign(exports, templates, {
  matchScriptType,
  scriptTypeMatches,
  executeTemplate
})
