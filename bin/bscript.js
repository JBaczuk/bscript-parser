#!/usr/bin/env node

const bscript = require('../index.js')
const program = require('commander')
const { version } = require('../package.json')

program
  .version(version, '-v, --version')

// Assemble
program
  .command('assemble <raw-script>')
  .option('-l, --literal-style [style]', 'Literal Style normal|brackets|prefixed|verbose', isString, 'normal')
  .option('-e, --encoding [encoding]', 'Encoding ascii|base64|binary|hex|utf8', isString, 'hex')
  .action(function (rawScript) {
    let options = {
      literalStyle: this.literalStyle,
      encoding: this.encoding
    }

    let asm
    try {
      asm = bscript.rawToAsm(rawScript, options)
    } catch (err) {
      console.error(err.message)
      return
    }
    console.log(asm)
  })

// Disassemble
program
  .command('disassemble <asm>')
  .option('-e, --encoding [encoding]', 'Encoding ascii|base64|binary|hex|utf8', isString, 'hex')
  .action(function (asm) {
    let options = {
      encoding: this.encoding
    }

    let raw
    try {
      raw = bscript.asmToRaw(asm, options)
    } catch (err) {
      console.error(err.message)
      return
    }
    console.log(raw)
  })

// opcodes
program
  .command('getopcode <word>')
  .action(function (word) {
    let opcode
    try {
      opcode = bscript.opcodes.opcodeForWord(word)
    } catch (err) {
      console.error(err.message)
      return
    }
    console.log(opcode)
  })

program
  .command('getword <opcode>')
  .action(function (opcode) {
    if (isNaN(parseInt(opcode))) throw Error('<opcode> must be a single 8 bit integer')
    let word
    try {
      word = bscript.opcodes.wordForOpcode(parseInt(opcode))
    } catch (err) {
      console.error(err.message)
      return
    }
    if (typeof word === 'undefined') {
      console.log(`no word found for opcode ${opcode}`)
    } else {
      console.log(word)
    }
  })

program
  .command('isvalid <opcode-or-word>')
  .action(function (value) {
    let isValid
    try {
      if (!isNaN(parseInt(value))) {
        isValid = bscript.opcodes.opcodeIsValid(parseInt(value))
      } else {
        isValid = bscript.opcodes.wordIsValid(value)
      }
    } catch (err) {
      console.error(err.message)
      return
    }
    console.log(isValid)
  })

program
  .command('isdisabled <opcode-or-word>')
  .action(function (value) {
    let isDisabled
    try {
      if (!isNaN(parseInt(value))) {
        isDisabled = bscript.opcodes.opcodeIsDisabled(parseInt(value))
      } else {
        isDisabled = bscript.opcodes.wordIsDisabled(value)
      }
    } catch (err) {
      console.error(err.message)
      return
    }
    console.log(isDisabled)
  })

program
  .command('describe <opcode-or-word>')
  .action(function (value) {
    let word
    let description
    try {
      if (!isNaN(parseInt(value))) {
        word = bscript.opcodes.wordForOpcode(parseInt(value))
        description = bscript.opcodes.descriptionForOpcode(value)
      } else {
        word = value
        description = bscript.opcodes.descriptionForWord(value)
      }
    } catch (err) {
      console.error(err.message)
      return
    }
    if (typeof word !== 'undefined') {
      console.log(word)
    }
    console.log(description)
  })

// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command')
  program.outputHelp()
})

program.parse(process.argv)

// arg 1 is the node binary
// arg 2 is bscript.js
if (process.argv.length < 3) {
  program.outputHelp()
}

function isString (value) {
  if (typeof value !== 'string') return 'hex'
  return value
}
