const expect = require('chai').expect
const Token = require('../token')

describe('Token', () => {
  it('is a constructor', () => {
    expect(typeof Token).to.equal('function')
  })
})
