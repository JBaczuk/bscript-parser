const opcodeInfo = require('./opcode_info')

const map = module.exports

opcodeInfo.forEach((info) => {
  info.opcodes.forEach((opcode) => {
    map[opcode] = info
  })
})
