const {
  opcodeIsValid,
} = require('./opcodes')

const {
  opcode,
  literal
} = require('./token')

module.exports = parseScript
function parseScript (bytes) {
  let idx = 0
  let token
  const l = bytes.length
  const tokens = []
  while (idx < l) {
    [token, idx] = nextOp(bytes, idx)
    tokens.push(token)
  }

  return tokens
}

function nextOp (bytes, idx) {
  const op = bytes.readUInt8(idx)
  const start = idx

  if (op > 0 && op < 76) {
    idx += 1
    const buf = Buffer.alloc(op)
    bytes.copy(buf, 0, idx, idx + op)
    idx += op
    return [literal(buf, start, idx), idx]
  } else if (op === 76) {
    idx += 1
    const size = bytes.readUInt8(idx)
    idx += 1
    const buf = Buffer.alloc(size)
    bytes.copy(buf, 0, idx, idx + size)
    idx += size
    return [literal(buf, start, idx), idx]
  } else if (op === 77) {
    idx += 1
    const size = bytes.readUInt16LE(idx)
    idx += 2
    const buf = Buffer.alloc(size)
    bytes.copy(buf, 0, idx, idx + size)
    idx += size
    return [literal(buf, start, idx), idx]
  } else if (op === 78) {
    idx += 1
    const size = bytes.readUInt32LE(idx)
    idx += 4
    const buf = Buffer.alloc(size)
    bytes.copy(buf, 0, idx, idx + size)
    idx += size
    return [literal(buf, start, idx), idx]
  } else if (!opcodeIsValid(op)) {
    // invalid op
    throw new Error(`Opcode ${op} at index ${start} is not valid`)
  }

  return [opcode(op, start, idx + 1), idx + 1]
}
