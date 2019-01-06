const expect = require('chai').expect
const script = require('../index.js')
const conversions = require('./fixtures/conversions.json')

describe('Parse Tests', function () {
  describe('rawToAsm Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected assembly', function () {
          const parsedScript = script.rawToAsm(conversion.raw)
          expect(parsedScript).to.equal(conversion.asm)
        })
      })
    })
  })

  describe('asmToRaw Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected raw script', function () {
          const parsedScript = script.asmToRaw(conversion.asm, 'hex')
          expect(parsedScript).to.equal(conversion.raw)
        })
      })
    })
  })

  describe('formatAsm Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected raw script', function () {
          const parsedScript = script.formatAsm(conversion.asm, 'hex')
          expect(parsedScript).to.equal(conversion.asm)
        })
      })
    })
  })
})
