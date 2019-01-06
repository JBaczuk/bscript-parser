const parseScript = require('./src/parseScript')
const parseAsm = require('./src/parseAsm')
const opcodes = require('./src/opcodes')

let parseRawScript = function (rawScript, format = 'hex') {
  if (typeof rawScript === 'string') {
    rawScript = Buffer.from(rawScript, format)
  }

  if (!(rawScript instanceof Buffer)) {
    throw new Error('Raw script must be a string or buffer')
  }

  const tokens = parseScript(rawScript)
  return tokens.map((token) => token.toAsm()).join(' ')
}

let parseAsmScript = function (asmScript, outputFormat = 'binary') {
  if (typeof asmScript !== 'string') {
    throw new Error('Assembly must be a string')
  }

  const tokens = parseAsm(asmScript)

  const script = Buffer.concat(tokens.map((token) => token.toScript()))

  switch (outputFormat) {
    case 'binary':
      return script
    case 'hex':
      return script.toString('hex')
  }

  throw new Error(`Unknown output format ${outputFormat}`)
}

module.exports = {
  parseRawScript,
  parseAsmScript,
  opcodes
}
