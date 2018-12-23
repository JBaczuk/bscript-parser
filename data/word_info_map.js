const opcodeInfo = require('./opcode_info')

const map = module.exports

opcodeInfo.forEach((info) => {
  info.words.forEach((word) => {
    map[word] = info
  })
})
