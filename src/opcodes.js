const assert = require('assert')

const opcodeInfoMap = require('../data/opcode_info_map')
const wordInfoMap = require('../data/word_info_map')

function opcodeForWord (word) {
  assert(wordIsValid(word), `${word} is not a valid term`)
  const info = wordInfoMap[word]
  const idx = info.opcodes.length === 1 ? 0 : info.words.indexOf(word)
  return info.opcodes[idx]
}

function wordForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  const info = opcodeInfoMap[opcode]

  if (info.word === 'N/A') {
    // special case... not sure what should be returned
    return undefined
  }

  const idx = info.words.length === 1 ? 0 : info.opcodes.indexOf(opcode)
  return info.words[idx]
}

function opcodeIsValid (opcode) {
  return opcodeInfoMap.hasOwnProperty(opcode)
}

function wordIsValid (word) {
  return wordInfoMap.hasOwnProperty(word)
}

function descriptionForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].description || ''
}

function descriptionForWord (word) {
  return descriptionForOpcode(opcodeForWord(word))
}

function inputDescriptionForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].input || ''
}

function inputDescriptionForWord (word) {
  return inputDescriptionForOpcode(opcodeForWord(word))
}

function outputDescriptionForOpcode (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].output || ''
}

function outputDescriptionForWord (word) {
  return outputDescriptionForOpcode(opcodeForWord(word))
}

function opcodeIsDisabled (opcode) {
  assert(opcodeIsValid(opcode), `${opcode} is not a valid opcode`)
  return opcodeInfoMap[opcode].disabled
}

function wordIsDisabled (word) {
  return opcodeIsDisabled(opcodeForWord(word))
}

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
