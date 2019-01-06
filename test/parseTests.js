const expect = require('chai').expect
const script = require('../index.js')
const conversions = require('./fixtures/conversions.json')

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
})
