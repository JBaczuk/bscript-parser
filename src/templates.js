const parseAsm = require('./parseAsm')
const Token = require('./token')

const parseOpts = { allowPlaceHolder: true }

const p2pk = parseAsm('<65-byte-pubkey> OP_CHECKSIG', parseOpts)
const p2pkh = parseAsm('OP_DUP OP_HASH160 <20-byte-pubkey-hash> OP_EQUALVERIFY OP_CHECKSIG', parseOpts)
const p2sh = parseAsm('OP_HASH160 <20-byte-script-hash> OP_EQUAL', parseOpts)
const p2wpkh = parseAsm('0 <20-byte-pubkey-hash>', parseOpts)
const p2wsh = parseAsm('0 <32-byte-hash>', parseOpts)

const templates = {
  p2pk,
  p2pkh,
  p2sh,
  p2wpkh,
  p2wsh
}

function scriptTypeMatches (tokens, template) {
  if (tokens.length !== template.length) {
    // This will not be valid if variable length templates are included
    return false
  }

  for (let i = 0, l = tokens.length; i < l; i++) {
    const t1 = tokens[i]
    const t2 = template[i]

    if (t2.type === Token.OPCODE) {
      if (t1.type !== Token.OPCODE || t1.value !== t2.value) {
        return false
      }
    } else if (t2.type === Token.PLACEHOLDER) {
      if (t1.type !== Token.LITERAL) {
        return false
      }
      if (/^[0-9]+-byte/.test(t2.value)) {
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
}

function matchScriptType (tokens) {
  return Object.keys(templates).find((key) => {
    return scriptTypeMatches(tokens, templates[key])
  })
}

Object.assign(exports, templates, {
  matchScriptType,
  scriptTypeMatches
})
