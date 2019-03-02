const opcodes = require('../src/opcodes')
const expect = require('chai').expect

const {
  opcodeForWord,
  wordForOpcode,
  opcodeIsValid,
  wordIsValid,
  descriptionForOpcode,
  descriptionForWord,
  inputDescriptionForOpcode,
  inputDescriptionForWord,
  outputDescriptionForOpcode,
  outputDescriptionForWord,
  opcodeIsDisabled,
  wordIsDisabled
} = opcodes

describe('opcodes', function () {
  describe('.opcodeForWord', function () {
    it('gets the associated opcode for a term', function () {
      expect(opcodeForWord('OP_1NEGATE')).to.equal(79)
      expect(opcodeForWord('OP_15')).to.equal(95)
      expect(opcodeForWord('OP_FALSE')).to.equal(0)
    })
    it('throws if the word is invalid', function () {
      expect(() => opcodeForWord('OP_CLONE')).to.throw('OP_CLONE is not a valid term')
    })
  })

  describe('.wordForOpcode', function () {
    it('gets the associated term for an opcode', function () {
      expect(wordForOpcode(79)).to.equal('OP_1NEGATE')
      expect(wordForOpcode(95)).to.equal('OP_15')
      expect(wordForOpcode(0)).to.equal('OP_0')
    })
    it('throws if the opcode does not exist', function () {
      expect(() => wordForOpcode(257)).to.throw('257 is not a valid opcode')
      expect(() => wordForOpcode(-1)).to.throw('-1 is not a valid opcode')
    })
    it('results in undefined for pushdata opcodes', function () {
      expect(wordForOpcode(1)).to.equal(undefined)
      expect(wordForOpcode(73)).to.equal(undefined)
    })
  })

  describe('.opcodeIsValid', function () {
    it('returns whether or not an opcode is a recognized opcode', function () {
      expect(opcodeIsValid(6)).to.equal(true)
      expect(opcodeIsValid(186)).to.equal(false)
      expect(opcodeIsValid(110)).to.equal(true)
      expect(opcodeIsValid(-1)).to.equal(false)
      expect(opcodeIsValid(256)).to.equal(false)
    })
  })

  describe('.wordIsValid', function () {
    it('returns whether or not a term is a recognized term', function () {
      expect(wordIsValid('OP_FALSE')).to.equal(true)
      expect(wordIsValid('OP_0')).to.equal(true)
      expect(wordIsValid('OP_CAT')).to.equal(true)
      expect(wordIsValid('OP_CLONE')).to.equal(false)
    })
  })

  describe('.descriptionForOpcode', function () {
    it('gets the description for an opcode', function () {
      expect(descriptionForOpcode(135)).to.equal('Returns 1 if the inputs are exactly equal, 0 otherwise.')
    })
    it('throws if the term does not exist', function () {
      expect(() => descriptionForOpcode(257)).to.throw('257 is not a valid opcode')
    })
    it('handles push data opcodes (0x01-0x4b) specially', function () {
      expect(descriptionForOpcode(1)).to.equal('The next byte is data to be pushed onto the stack')
      expect(descriptionForOpcode(2)).to.equal('The next 2 bytes is data to be pushed onto the stack')
      expect(descriptionForOpcode(75)).to.equal('The next 75 bytes is data to be pushed onto the stack')
    })
  })

  describe('.descriptionForWord', function () {
    it('gets the description for a term', function () {
      expect(descriptionForWord('OP_EQUAL')).to.equal('Returns 1 if the inputs are exactly equal, 0 otherwise.')
    })
    it('throws if the word is invalid', function () {
      expect(() => descriptionForWord('OP_CLONE')).to.throw('OP_CLONE is not a valid term')
    })
  })

  describe('.inputDescriptionForOpcode', function () {
    it('gets the description of the input for the opcode', function () {
      expect(inputDescriptionForOpcode(135)).to.equal('x1 x2')
    })
    it('throws if the opcode does not exist', function () {
      expect(() => inputDescriptionForOpcode(257)).to.throw('257 is not a valid opcode')
    })
  })

  describe('.inputDescriptionForWord', function () {
    it('gets the description of the input for the term', function () {
      expect(inputDescriptionForWord('OP_EQUAL')).to.equal('x1 x2')
    })
    it('throws if the term does not exist', function () {
      expect(() => inputDescriptionForWord('OP_CLONE')).to.throw('OP_CLONE is not a valid term')
    })
  })

  describe('.outputDescriptionForOpcode', function () {
    it('gets the description of the output for the opcode', function () {
      expect(outputDescriptionForOpcode(135)).to.equal('True / false')
    })
    it('throws if the opcode does not exist', function () {
      expect(() => outputDescriptionForOpcode(257)).to.throw('257 is not a valid opcode')
    })
  })

  describe('.outputDescriptionForWord', function () {
    it('gets the description of the output for the term', function () {
      expect(outputDescriptionForWord('OP_EQUAL')).to.equal('True / false')
    })
    it('throws if the term does not exist', function () {
      expect(() => outputDescriptionForWord('OP_CLONE')).to.throw('OP_CLONE is not a valid term')
    })
  })

  describe('.opcodeIsDisabled', function () {
    it('returns whether or not an opcode is disabled', function () {
      expect(opcodeIsDisabled(135)).to.equal(false)
      expect(opcodeIsDisabled(142)).to.equal(true)
    })
    it('throws if the opcode does not exist', function () {
      expect(() => opcodeIsDisabled(257)).to.throw('257 is not a valid opcode')
    })
  })

  describe('.wordIsDisabled', function () {
    it('returns whether or not a word references a disabled opcode', function () {
      expect(wordIsDisabled('OP_EQUAL')).to.equal(false)
      expect(wordIsDisabled('OP_2DIV')).to.equal(true)
    })
    it('throws if the term does not exist', function () {
      expect(() => wordIsDisabled('OP_CLONE')).to.throw('OP_CLONE is not a valid term')
    })
  })
})
