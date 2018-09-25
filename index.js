const ops = require('bitcoin-ops')
const rOps = require('bitcoin-ops/map')

let parseRawScriptHex = function (rawScript, parsedScript) {
    console.debug(`rawScript: ${rawScript}`)
    let opStr = rawScript.substring(0,2)
    let op = parseInt(`0x${opStr}`)
    // Custom descriptors (not necessarily op codes)
    if (op > 0 && op < 76) {
        console.debug(`op: ${op}`)
        parsedScript += `PUSHDATA(${op})[${rawScript.substring(2, 2+(2*op))}] `
        console.debug(`parsedScript: ${parsedScript}`)
        rawScript = rawScript.substring(2+(2*op))
    } else {
        console.debug(`op: ${op}`)
        parsedScript += `${rOps[op]} `
        console.debug(`parsedScript: ${parsedScript}`)
        rawScript = rawScript.substring(2)
    }
    console.debug(`rawScript.length: ${rawScript.length}`)
    if (rawScript.length > 0) {
        return parseRawScriptHex(rawScript, parsedScript)
    } else {
        console.debug(`done. parsedScript: ${parsedScript}`)
        console.debug(`parsedScript.length: ${parsedScript.length}`)
        console.debug(`final: ${parsedScript.substring(0, parsedScript.length -1)}`)
        return parsedScript.substring(0, parsedScript.length -1)
    }
}

let parseRawScript = function (rawScript, format) {
    let asm = ''
    switch (format) {
        case 'hex':
            if (Math.abs(rawScript.length % 2) == 1) {
                console.error('Invalid script length (odd number of characters)')
                return
            }
            asm = parseRawScriptHex(rawScript, asm)
            console.debug(`asm: ${asm}`)
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
