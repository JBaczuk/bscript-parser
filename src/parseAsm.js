const {
  opcodeForWord,
  wordIsValid
} = require('./opcodes')

const {
  opcode,
  literal,
  placeholder,
  repeat,
  LITERAL
} = require('./token')

const HEX_CHARS = new Set('0123456789abcdefABCDEF')
const DECIMAL_CHARS = new Set('0123456789')
const L_SQUARE_BRACKET = '['
const R_SQUARE_BRACKET = ']'
const L_ANGLE_BRACKET = '<'
const R_ANGLE_BRACKET = '>'
const DOT = '.'
const L_PAREN = '('
const R_PAREN = ')'
const ZERO = '0'
const WS = new Set(' \t\n\v\f\r')
// const QUOTES = new Set('"\'')
const X = new Set('x', 'X')
const END_DATA_LITERAL = new Set(R_SQUARE_BRACKET)
const END_PLACEHOLDER = new Set(R_ANGLE_BRACKET)
const END_TERM = new Set(WS)
END_TERM.add(undefined)

// doing this case insensitive
const TERM_CHARS = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_012356789')

module.exports = parseAsm
function parseAsm (asmText, options = {}) {
  let chars = Array.from(asmText)
  let idx = 0
  let token
  const l = chars.length
  const tokens = []
  while (idx < l) {
    [token, idx] = nextOp(chars, idx, options)
    if (token != null) {
      tokens.push(token)
    }
  }

  return tokens
}

function nextOp (chars, idx, options) {
  let first = peek(chars, idx)
  while (WS.has(first)) {
    // remove whitespace
    idx += 1
    first = peek(chars, idx)
  }

  if (first === undefined) {
    return [undefined, idx]
  } else if (first === L_SQUARE_BRACKET) {
    return parseDataLiteral(chars, idx + 1, END_DATA_LITERAL, idx)
  } else if (first === L_ANGLE_BRACKET && options.allowPlaceHolder === true) {
    return parsePlaceHolder(chars, idx + 1, END_PLACEHOLDER, idx)
  } else if (first === DOT && options.allowPlaceHolder) {
    if (peek(chars, idx + 1) !== '.' || peek(chars, idx + 2) !== '.') {
      throw new Error(`Unexpected character at position ${idx}`)
    }

    return [repeat(idx, idx + 3), idx + 3]
  } else if (first === ZERO) {
    const nextChar = peek(chars, idx, 1)
    if (X.has(nextChar)) {
      // hex literal
      return parseDataLiteral(chars, idx + 2, END_TERM, idx)
    } else if (nextChar === undefined || WS.has(nextChar)) {
      // literal nulldata (OP_0)
      return [opcode(0, idx, idx + 1), idx + 1]
    } else {
      // hex literal
      return parseDataLiteral(chars, idx, END_TERM)
    }
  } else if (TERM_CHARS.has(first)) {
    // opcode
    try {
      return parseTerm(chars, idx, options)
    } catch (e) {
      if (HEX_CHARS.has(first)) {
        return parseDataLiteral(chars, idx, END_TERM)
      }

      throw e
    }
  } else if (HEX_CHARS.has(first)) {
    return parseDataLiteral(chars, idx, END_TERM)
  }

  throw new Error(`Unexpected character at position ${idx}`)
}

function parseDataLiteral (chars, idx, terminator, start = idx) {
  const hex = []

  let first = peek(chars, idx)
  while (first !== undefined && !terminator.has(first)) {
    if (WS.has(first)) {
      // skip whitespace
      idx += 1
      first = peek(chars, idx)
      continue
    } else if (!HEX_CHARS.has(first)) {
      throw new Error(`Invalid hexadecimal character in literal starting at position ${idx}`)
    }

    hex.push(first)
    idx += 1
    first = peek(chars, idx)
  }

  if (!terminator.has(first)) {
    throw new Error(`Unterminated literal starting at position ${start}`)
  }

  // remove trailing `]` (or other non-whitespace terminator)
  if (typeof first !== 'undefined' && !WS.has(first)) {
    idx += 1
  }

  const data = Buffer.from(hex.join(''), 'hex')

  return [literal(data, start, idx), idx]
}

function parsePlaceHolder (chars, idx, terminator, start = idx) {
  const string = []

  let first = peek(chars, idx)
  while (first !== undefined && !terminator.has(first)) {
    string.push(first)
    idx += 1
    first = peek(chars, idx)
  }

  if (!terminator.has(first)) {
    throw new Error(`Unterminated placeholder starting at position ${start}`)
  }

  // remove trailing `>`
  idx += 1

  const data = string.join('').trim()

  return [placeholder(data, start), idx]
}

function parseTerm (chars, idx, options) {
  const {
    terms = {}
  } = options

  const start = idx
  let first = peek(chars, idx)
  let term = []
  while (!END_TERM.has(first)) {
    if (first === L_PAREN && term.join('') === 'PUSHDATA') {
      // special case where we permit PUSHDATA(n)
      idx += 1
      const numberStart = idx
      const digits = []
      first = peek(chars, idx)
      while (first !== R_PAREN && first !== undefined) {
        if (!DECIMAL_CHARS.has(first)) {
          throw new Error(`Invalid PUSHDATA value starting at ${numberStart}`)
        }

        digits.push(first)
        idx += 1
        first = peek(chars, idx)
      }

      if (first !== R_PAREN) {
        throw new Error(`Unterminated PUSHDATA literal starting at position ${start}`)
      } else if (digits.length === 0) {
        throw new Error(`Missing PUSHDATA value at position ${numberStart}`)
      }

      // advance pass ending paren
      idx += 1
      const bytesExpected = parseInt(digits.join(''))
      const [nextToken, nextIdx] = nextOp(chars, idx)
      if (nextToken == null || nextToken.type !== LITERAL) {
        throw new Error(`PUSHDATA at ${start} requires a literal to follow it`)
      } else if (nextToken.value.length !== bytesExpected) {
        throw new Error(`PUSHDATA value at ${nextToken.startIndex} does not have the correct size`)
      }

      // replace start index
      nextToken.startIndex = start
      return [nextToken, nextIdx]
    } else if (!TERM_CHARS.has(first)) {
      throw new Error(`Invalid term starting at position ${start}`)
    }

    term.push(first)
    idx += 1
    first = peek(chars, idx)
  }

  term = term.join('').toUpperCase()
  if (!term.startsWith('OP_')) {
    term = `OP_${term}`
  }

  // allow terms to be overriden
  if (typeof terms[term] === 'number') {
    return [opcode(terms[term], start), idx]
  }

  if (!wordIsValid(term)) {
    // invalid term
    throw new Error(`Unknown term ${term} found at position ${start}`)
  }

  const op = opcodeForWord(term)
  return [opcode(op, start, idx), idx]
}

function peek (arr, idx, skip = 0) {
  return arr[idx + skip]
}
