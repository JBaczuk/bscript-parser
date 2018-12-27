const expect = require('chai').expect
const script = require('../index.js')
const conversions = require('./fixtures/conversions.json')

describe('Parse Tests', function () {
  describe('parseRawScript Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected assembly', function () {
          const parsedScript = script.parseRawScript(conversion.raw)
          expect(parsedScript).to.equal(conversion.asm)
        })
      })
    })
  })

  describe('parseAsmScript Tests', function () {
    conversions.forEach(function (conversion) {
      describe(conversion.name, function () {
        it('returns the expected raw script', function () {
          const parsedScript = script.parseAsmScript(conversion.asm, 'hex')
          expect(parsedScript).to.equal(conversion.raw)
        })
      })
    })
  })
})
