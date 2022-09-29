'use strict';


const hash = {
	'SHA-256': {
		bits: 256,
		bytes: 32,
		deprecated: false
	},
	'SHA-384': {
		bits: 384,
		bytes: 48,
		deprecated: false
	},
	'SHA-512': {
		bits: 512,
		bytes: 64,
		deprecated: false
	},
	'SHA-1': {
		bits: 160,
		bytes: 20,
		deprecated: true
	}
}

module.exports = hash;
