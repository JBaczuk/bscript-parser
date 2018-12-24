const expect = require('chai').expect
const parseAsm = require('../parseAsm')
const Token = require('../token')

describe('parseAsm', function () {
  it('correctly parses a term', function () {
    const parsed = parseAsm('OP_EQUAL')
    expect(parsed).to.deep.equal([
      Token.opcode(135, 0)
    ])
  })

  it('correctly parses hex data into a literal', function () {
    const parsed = parseAsm('abcdef012345')
    expect(parsed).to.deep.equal([
      Token.literal(Buffer.from('abcdef012345', 'hex'), 0)
    ])
  })

  it('correctly parses `0x` prefixed hex data into a literal', function () {
    const parsed = parseAsm('0xabcdef012345')
    expect(parsed).to.deep.equal([
      Token.literal(Buffer.from('abcdef012345', 'hex'), 0)
    ])
  })

  it('correctly parses square bracket enclosed hex data into a literal', function () {
    const parsed = parseAsm('[abcdef012345]')
    expect(parsed).to.deep.equal([
      Token.literal(Buffer.from('abcdef012345', 'hex'), 0)
    ])
  })

  it('permits whitespace in a square bracket enclosed literal', function () {
    const parsed = parseAsm('[ab cd ef 01 23 45]')
    expect(parsed).to.deep.equal([
      Token.literal(Buffer.from('abcdef012345', 'hex'), 0)
    ])
  })

  it('allows for literals prefixed with PUSHDATA(n)', function () {
    const parsed = parseAsm('PUSHDATA(6)[abcdef012345]')
    expect(parsed).to.deep.equal([
      Token.literal(Buffer.from('abcdef012345', 'hex'), 0)
    ])
  })

  it('parses a 0 as OP_0', function () {
    const parsed = parseAsm('0')
    expect(parsed).to.deep.equal([
      Token.opcode(0, 0)
    ])
  })

  it('parses a longer script', function () {
    const hash160 = 'f'.repeat(40)
    const text = `OP_DUP OP_HASH160 [${hash160}] OP_EQUALVERIFY OP_CHECKSIG`
    const parsed = parseAsm(text)
    expect(parsed).to.deep.equal([
      Token.opcode(118, 0),
      Token.opcode(169, 7),
      Token.literal(Buffer.from(hash160, 'hex'), 18),
      Token.opcode(136, 61),
      Token.opcode(172, 76)
    ])
  })

  it('is tolerant of white space', function () {
    const parsed = parseAsm(' \n\tOP_EQUAL \n\t')
    expect(parsed).to.deep.equal([
      Token.opcode(135, 3)
    ])
  })
})
