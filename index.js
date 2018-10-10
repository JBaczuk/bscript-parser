const ops = require('bitcoin-ops')
const rOps = require('bitcoin-ops/map')

let parseRawScriptHex = function (rawScript, parsedScript) {
    let opStr = rawScript.substring(0,2)
    let op = parseInt(opStr, 16)
    // Custom descriptors (not necessarily op codes)
    if (op > 0 && op < 76) {
        parsedScript += `PUSHDATA(${op})[${rawScript.substring(2, 2+(2*op))}] `
        rawScript = rawScript.substring(2+(2*op))
    } else if (op === 76) {
        let bytesToPush = parseInt(rawScript.substring(2, 4), 16)
        parsedScript += `PUSHDATA(${bytesToPush})[${rawScript.substring(4, 4 + (2 * bytesToPush))}] `
        rawScript = rawScript.substring(4 + (2 * bytesToPush))
    } else if (op === 77) {
        let bytesToPush = parseInt(rawScript.substring(2, 6), 16)
        parsedScript += `PUSHDATA(${bytesToPush})[${rawScript.substring(6, 6 + (2 * bytesToPush))}] `
        rawScript = rawScript.substring(6 + (2 * bytesToPush))
    } else if (op === 78) {
        let bytesToPush = parseInt(rawScript.substring(2, 8), 16)
        parsedScript += `PUSHDATA(${bytesToPush})[${rawScript.substring(8, 8 + (2 * bytesToPush))}] `
        rawScript = rawScript.substring(8 + (2 * bytesToPush))
    } else { // TODO: 77 and 78
        parsedScript += `${rOps[op]} `
        rawScript = rawScript.substring(2)
    }
    if (rawScript.length > 0) {
        return parseRawScriptHex(rawScript, parsedScript)
    } else {
        return parsedScript.substring(0, parsedScript.length -1)
    }
}

// TODO: Could also include a dissasembly https://defuse.ca/online-x86-assembler.htm#disassembly2

let parseRawScript = function (rawScript, format='hex') {
    let asm = ''
    switch (format) {
        case 'hex':
            if (Math.abs(rawScript.length % 2) == 1) {
                console.error('Invalid script length (odd number of characters)')
                return
            }
            asm = parseRawScriptHex(rawScript, asm)
            break
        default:
            console.error('Unrecognized format: ' + format)
            break;
    }
    return asm
}

let parseAsmScript = function () {

}

module.exports = {
    parseRawScript: parseRawScript
}
