const expect = require('chai').expect
const bop = require('../index.js')

describe('Parse Tests', function() {
	describe('parseRawScript Tests', function() {
        describe('P2PK (Genesis Block) scriptPubkey', function () {
		    it('returns expected assembly', function() {
                parsedScript = bop.parseRawScript('410483a2eb1d9ae027fe47c8ec88e6d9e6a3903f5d0e5602fa232a0fe221dae256b17f8c6207229c6261a6659c12c59265a3299cbb0e45d180d15d7226f29323894dac', 'hex')
                // TODO: Could indicate the type of transaction. E.g. P2PK: <asm>
                expect(parsedScript).to.equal('PUSHDATA(65)[0483a2eb1d9ae027fe47c8ec88e6d9e6a3903f5d0e5602fa232a0fe221dae256b17f8c6207229c6261a6659c12c59265a3299cbb0e45d180d15d7226f29323894d] OP_CHECKSIG')
		    })
        })

        // TODO: P2PKH

        describe('P2SH scriptPubkey', function () {
		    it('returns expected assembly', function() {
                parsedScript = bop.parseRawScript('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
                expect(parsedScript).to.equal('OP_HASH160 PUSHDATA(20)[c664139327b98043febeab6434eba89bb196d1af] OP_EQUAL')
		    })
        })

        describe('P2SH(P2WPKH) scriptSig', function () {
		    it('returns expected assembly', function() {
                parsedScript = bop.parseRawScript('160014d3530760601a3af53c7c93b01dfaf08d1ab156e0', 'hex')
                expect(parsedScript).to.equal('PUSHDATA(22)[0014d3530760601a3af53c7c93b01dfaf08d1ab156e0]')
                // TODO: Maybe show the redeem script, e.g.
                // expect(parsedScript).to.equal('PUSHDATA(22)[SEGWIT_VERSION_0(P2WPKH) PUSHDATA(20)[d3530760601a3af53c7c93b01dfaf08d1ab156e0]]')
		    })
            // See https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki#P2WPKH
            // TODO: P2WSH
            // TODO: P2SH(P2WSH)
        })
	})

	describe('parseAsmScript Tests', function() {
		it('returns 0 * 4 = 4', function() {
            // TODO
		})
	})
})
