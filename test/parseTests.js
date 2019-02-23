const expect = require('chai').expect
const script = require('../index.js')
const conversions = require('./fixtures/conversions.json')
const Token = require('../src/token.js')
const redeem = require('./fixtures/redeem.json')

describe('Parse Tests', function () {
  describe('rawToAsm Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected assembly', function () {
          let parsedScript
          if (conversion.opts) {
            parsedScript = script.rawToAsm(conversion.raw, conversion.opts)
          } else {
            parsedScript = script.rawToAsm(conversion.raw)
          }
          expect(parsedScript).to.equal(conversion.asm)
        })
      })
    })
  })

  describe('rawToAddress Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected address', function () {
          let address
          if (conversion.opts) {
            address = script.rawToAddress(conversion.raw, conversion.opts)
          } else {
            address = script.rawToAddress(conversion.raw)
          }
          expect(address).to.equal(conversion.address)
        })
      })
    })
  })

  describe('asmToRaw Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected raw script', function () {
          let parsedScript
          if (conversion.opts) {
            parsedScript = script.asmToRaw(conversion.asm, conversion.opts)
          } else {
            parsedScript = script.asmToRaw(conversion.asm, 'hex')
          }
          expect(parsedScript).to.equal(conversion.raw)
        })
      })
    })
  })

  describe('asmToAddress Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected address', function () {
          let address
          if (conversion.opts) {
            address = script.asmToAddress(conversion.asm, conversion.opts)
          } else {
            address = script.asmToAddress(conversion.asm)
          }
          expect(address).to.equal(conversion.address)
        })
      })
    })
  })

  describe('addressToRaw Tests', function () {
    conversions.forEach(function (conversion) {
      if (conversion.address) {
        describe(conversion.name, function () {
          it('returns the expected raw script', function () {
            let parsedScript
            if (conversion.opts) {
              parsedScript = script.addressToRaw(conversion.address, conversion.opts)
            } else {
              parsedScript = script.addressToRaw(conversion.address, 'hex')
            }
            expect(parsedScript).to.equal(conversion.raw)
          })
        })
      }
    })
  })

  describe('addressToAsm Tests', function () {
    conversions.forEach(function (conversion) {
      if (conversion.address) {
        describe(conversion.name, function () {
          it('returns the expected asm script', function () {
            let parsedScript
            if (conversion.opts) {
              parsedScript = script.addressToAsm(conversion.address, conversion.opts)
            } else {
              parsedScript = script.addressToAsm(conversion.address)
            }
            expect(parsedScript).to.equal(conversion.asm)
          })
        })
      }
    })
  })

  describe('formatAsm Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected raw script', function () {
          let parsedScript
          if (conversion.opts) {
            parsedScript = script.formatAsm(conversion.asm, conversion.opts)
          } else {
            parsedScript = script.formatAsm(conversion.asm)
          }
          expect(parsedScript).to.equal(conversion.asm)
        })
      })
    })
  })

  describe('scriptType Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('determines the correct script type', function () {
          const parsed = script.fromRaw(conversion.raw, 'hex')
          expect(parsed.scriptType).to.equal(conversion.scriptType)
        })
      })
    })
  })
  describe('redeem', function () {
    redeem.forEach(function (conversion, idx) {
      describe(conversion.name || `redeem ${idx}`, function () {
        it('returns the expected redeem', function () {
          const parsedScript = script.fromRaw(conversion.raw)
          if (conversion.valid) {
            const redeemScript = parsedScript.redeemScript
            expect(typeof redeemScript).to.equal('object')
            expect(redeemScript.toRaw('hex')).to.equal(conversion.redeem)
          } else {
            expect(conversion.redeemScript).to.equal(undefined)
          }
        })
      })
    })
  })

  describe('fromAddress Tests', function () {
    conversions.forEach(function (conversion) {
      if (conversion.address) {
        describe(conversion.address, function () {
          it('calculates the correct script for an address', function () {
            let encoding = 'hex'
            if (conversion.opts && conversion.opts.encoding) {
              encoding = conversion.opts.encoding
            }
            const parsed = script.fromAddress(conversion.address)
            expect(parsed.toRaw(encoding)).to.equal(conversion.raw)
          })
        })
      }
    })
  })
  describe('toAddress Tests', function () {
    conversions.forEach(function (conversion) {
      if (conversion.address) {
        describe(conversion.address, function () {
          it('converts the script to the correct address', function () {
            let encoding = 'hex'
            if (conversion.opts && conversion.opts.encoding) {
              encoding = conversion.opts.encoding
            }
            const parsed = script.fromRaw(conversion.raw, encoding)
            expect(parsed.hasAddress).to.equal(true)
            expect(parsed.toAddress()).to.equal(conversion.address)
          })
        })
      } else {
        describe(conversion.name, function () {
          it('does not have an address', function () {
            const parsed = script.fromRaw(conversion.raw)
            expect(parsed.hasAddress).to.equal(false)
            expect(parsed.toAddress()).to.equal(undefined)
          })
        })
      }
    })
  })
  describe('asm tokens Tests', function () {
    conversions.forEach(function (conversion) {
      if (conversion.tokens && conversion.tokens.asm) {
        const expected = conversion.tokens.asm.map((data) => {
          data = [
            data[0],
            typeof data[1] === 'string'
              ? data[0] === 'OPCODE'
                ? script.opcodes.opcodeForWord(data[1])
                : Buffer.from(data[1], 'hex')
              : data[1],
            data[2],
            data[3]
          ]
          return new Token(...data)
        })
        describe(conversion.name, function () {
          it('generates the expected tokens when parsing asm', function () {
            const parsedScript = script.fromAsm(conversion.asm)
            expect(parsedScript.tokens).to.deep.equal(expected)
          })
        })
      }
    })
  })

  describe('raw tokens Tests', function () {
    conversions.forEach(function (conversion) {
      if (conversion.tokens && conversion.tokens.raw) {
        const expected = conversion.tokens.raw.map((data) => {
          data = [
            data[0],
            typeof data[1] === 'string'
              ? data[0] === 'OPCODE'
                ? script.opcodes.opcodeForWord(data[1])
                : Buffer.from(data[1], 'hex')
              : data[1],
            data[2],
            data[3]
          ]
          return new Token(...data)
        })
        describe(conversion.name, function () {
          it('generates the expected tokens when parsing asm', function () {
            const parsedScript = script.fromRaw(conversion.raw)
            expect(parsedScript.tokens).to.deep.equal(expected)
          })
        })
      }
    })
  })
})
