const expect = require('chai').expect
const bop = require('../index.js')

describe('Parse Tests', function() {
	describe('parseRawScript Tests', function() {
		it('returns ', function() {
            parsedScript = bop.parseRawScript('a914c664139327b98043febeab6434eba89bb196d1af87', 'hex')
            expect(parsedScript).to.equal('OP_HASH160 PUSHDATA(20)[c664139327b98043febeab6434eba89bb196d1af] OP_EQUAL')
		});
	});

	describe('parseAsmScript Tests', function() {
		it('returns 0 * 4 = 4', function() {
            // TODO
		});
	});
});
