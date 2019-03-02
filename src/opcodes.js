const assert = require('assert')

const opcodeInfoMap = require('../data/opcode_info_map')
const wordInfoMap = require('../data/word_info_map')

/**
 * Get the opcode of an opcode string
 *
 * @memberof opcodes
 * @param {string} word - The opcode string.
 * @return {number} The opcode for the word
 * @example
 * assert.equal(135, opcodes.opcodeForWord('OP_EQUAL'))
 * @throws AssertError When the word is not a valid opcode string.
 */
function opcodeForWord (word) {
  assert(wordIsValid(word), `${word} is not a valid term`)
  const info = wordInfoMap[word]
  const idx = info.words.indexOf(word)
  return info.opcodes[idx]
}

/**
 * Get the opcode string of an opcode
 *
 * @memberof opcodes
 * @param {number} opcode
 * @return {string} The opcode string for the opcode
 * @example
 * assert.equal('OP_EQUAL', opcodes.wordForOpcode(135))
 * @throws AssertionError When the opcode is not a valid opcode.
 */
function wordForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  const info = opcodeInfoMap[opcode]

  if (info.word === 'N/A') {
    // special case... not sure what should be returned
    return undefined
  }

  const idx = info.opcodes.indexOf(opcode)
  return info.words[idx]
}

/**
 * Determines whether an opcode is valid
 *
 * @memberof opcodes
 * @param {number} opcode
 * @return {boolean} `true` if the opcode is valid, `false` if not.
 * @example
 * assert.equal(true, opcodes.opcodeIsValid(135))
 * assert.equal(false, opcodes.opcodeIsValid(1000))
 */
function opcodeIsValid (opcode) {
  return opcodeInfoMap.hasOwnProperty(opcode)
}

/**
 * Determines whether an opcode string is valid
 *
 * @memberof opcodes
 * @param {string} word
 * @return {boolean} `true` if the word is valid, `false` if not.
 * @example
 * assert.equal(true, opcodes.wordIsValid('OP_EQUAL'))
 * assert.equal(false, opcodes.wordIsValid('OP_BAD'))
 */
function wordIsValid (word) {
  return wordInfoMap.hasOwnProperty(word)
}

/**
 * Gets a description for an opcode
 *
 * @memberof opcodes
 * @param {number} opcode
 * @return {string} The description of the opcode
 * @throws AssertionError When opcode is invalid.
 * @example
 * const expected = 'Returns 1 if the inputs are exactly equal, 0 otherwise.'
 * assert.equal(expected, opcodes.descriptionForOpcode(135))
 */
function descriptionForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].description || ''
}

/**
 * Gets a description for an opcode string
 *
 * @memberof opcodes
 * @param {string} word
 * @return {string} The description of the opcode
 * @throws AssertionError When word is invalid.
 * @example
 * const expected = 'Returns 1 if the inputs are exactly equal, 0 otherwise.'
 * assert.equal(expected, opcodes.descriptionForWord('OP_EQUAL'))
 */
function descriptionForWord (word) {
  return descriptionForOpcode(opcodeForWord(word))
}

/**
 * Gets a description of the input for an opcode
 *
 * @memberof opcodes
 * @param {number} opcode
 * @return {string} The description of the opcode's input
 * @throws AssertionError When opcode is invalid.
 * @example
 * const expected = 'x1 x2'
 * assert.equal(expected, opcodes.inputDescriptionForOpcode(135))
 */
function inputDescriptionForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].input || ''
}

/**
 * Gets a description of the input for an opcode string
 *
 * @memberof opcodes
 * @param {string} word
 * @return {string} The description of the opcode's input
 * @throws AssertionError When word is invalid.
 * @example
 * const expected = 'x1 x2'
 * assert.equal(expected, opcodes.inputDescriptionForWord('OP_EQUAL'))
 */
function inputDescriptionForWord (word) {
  return inputDescriptionForOpcode(opcodeForWord(word))
}

/**
 * Gets a description of the output for an opcode
 *
 * @memberof opcodes
 * @param {number} opcode
 * @return {string} The description of the opcode's output
 * @throws AssertionError When opcode is invalid.
 * @example
 * const expected = 'True / false'
 * assert.equal(expected, opcodes.outputDescriptionForOpcode(135))
 */
function outputDescriptionForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].output || ''
}

/**
 * Gets a description of the output for an opcode string
 *
 * @memberof opcodes
 * @param {string} word
 * @return {string} The description of the opcode's output
 * @throws AssertionError When word is invalid.
 * @example
 * const expected = 'True / false'
 * assert.equal(expected, opcodes.outputDescriptionForWord('OP_EQUAL'))
 */
function outputDescriptionForWord (word) {
  return outputDescriptionForOpcode(opcodeForWord(word))
}

/**
 * Gets whether or not an opcode is disabled in bitcoin-core
 *
 * @memberof opcodes
 * @param {number} opcode
 * @return {boolean} `true` if the opcode is disabled, `false` if not
 * @throws AssertionError When opcode is invalid.
 * @example
 * assert.equal(false, opcodes.opcodeIsDisabled(135))
 * assert.equal(true, opcodes.opcodeIsDisabled(134))
 */
function opcodeIsDisabled (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].disabled
}

/**
 * Gets whether or not an opcode string is disabled in bitcoin-core
 *
 * @memberof opcodes
 * @param {string} word
 * @return {boolean} `true` if the opcode is disabled, `false` if not
 * @throws AssertionError When word is invalid.
 * @example
 * assert.equal(false, opcodes.opcodeIsDisabled('OP_EQUAL'))
 * assert.equal(true, opcodes.opcodeIsDisabled('OP_XOR'))
 */
function wordIsDisabled (word) {
  return opcodeIsDisabled(opcodeForWord(word))
}

/**
 * @module opcodes
 *
 * @example
 * const {opcodes} = require('bscript-parser')
 */
module.exports = {
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
}
