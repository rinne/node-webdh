'use strict';

const wc = require('node:crypto').webcrypto;
const b64ux = require('b64ux');
const group = require('./group');
const hash = require('./hash');
const modPow = require('./modpow');

class WebDH {

	_groupName;
	_hashName;
	_secretA;
	_publicA;
	_sharedSecret;

	static hashes() {
		return Object.keys(hash);
	}

	static groups() {
		return Object.keys(group);
	}

	constructor(groupName, hashName) {
		this._groupName = null;
		this._hashName = null;
		this._secretA = null;
		this._publicA = null;
		this._sharedSecret = null;
		if (hashName) {
			if ((typeof(hashName) === 'string') && hash[hashName]) {
				this._hashName = hashName;
			} else {
				throw new Error('Invalid hash');
			}
		}
		if (groupName) {
			this._init(groupName);
		}
	}

	_init(groupName, hashName) {
		if (this._groupName) {
			throw new Error('DH alredy initialized');
		}
		if (! groupName) {
			groupName = 'modp2048';
		}
		if (! ((typeof(groupName) === 'string') && group[groupName])) {
			throw new Error('Bad DH group');
		}
		this._groupName = groupName;
		if (! hashName) {
			hashName = this._hashName ? this._hashName : 'SHA-256';
		}
		if (! this._hashName) {
			this._hashName = hashName;
		}
		if (hashName !== this._hashName) {
			throw new Error('Hash mismatch');
		}
		if (! ((typeof(hashName) === 'string') && hash[hashName])) {
			throw new Error('Invalid hash');
		}
		let rb = wc.getRandomValues(new Uint8Array(group[this._groupName].bytes));
		rb[0] >>= ((group[this._groupName].bytes * 8) - group[this._groupName].bits + 1);
		this._secretA = BigInt('0x' + this._hex(rb));
		let A = modPow(group[this._groupName].g, this._secretA, group[this._groupName].n).toString(16);
		if (A.length % 2) {
			A = '0' + A;
		}
		this._publicA = this._groupName + ':' + this._hashName + ':' + b64ux.encode(A, 'hex');
	}

	_hex(a) {
		let r = '';
		a.forEach(function(x) { r += ('0' + x.toString(16)).slice(-2); });
		return r;
	}

	async _hash(d) {
		return this._hex(new Uint8Array(await wc.subtle.digest(this._hashName, d)))
	}

	async challenge() {
		if (! this._publicA) {
			this._init();
		}
		return this._publicA;
	}

	async generate(b) {
		if (this._sharedSecret) {
			throw new Error('DH secret already generated');
		}
		if (! (typeof(b) === 'string')) {
			throw new Error('Invalid DH challenge');
		}
		let m = b.match(/^([^:]+):([^:]+):(.+)$/);
		if (! m) {
			throw new Error('Invalid DH challenge format');
		}
		if (this._hashName) {
			if (m[2] !== this._hashName) {
				throw new Error('Hash mismatch');
			}
		} else {
			if (hash[m[2]]) {
				this._hashName = m[2];
			} else {
				throw new Error('Invalid hash');
			}
		}
		if (this._groupName) {
			if (m[1] !== this._groupName) {
				throw new Error('DH group mismatch');
			}
		} else {
			try {
				this._init(m[1], m[2]);
			} catch(e) {
			}
			if (! this._groupName) {
				throw new Error('Invalid DH challenge');
			}
		}
		try {
			this._sharedSecret = await this._hash(this._groupName +
												  ':' +
												  modPow(BigInt('0x' + b64ux.decode(m[3], 'hex')),
														 this._secretA,
														 group[this._groupName].n).toString(16));
		} catch(e) {
			this._sharedSecret = null;
		}
		if (! this._sharedSecret) {
			throw new Error('Invalid DH challenge');
		}
		return true;
	}

	async secret() {
		if (! this._sharedSecret) {
			throw new Error('DH secret not generated');
		}
		return this._sharedSecret;
	}

	async key(id) {
		if (! this._sharedSecret) {
			throw new Error('DH secret not generated');
		}
		if (! id) {
			id = '';
		}
		if (Number.isSafeInteger(id)) {
			id = id.toString();
		}
		if (! (typeof(id) === 'string')) {
			throw new Error('Invalid key ID');
		}
		return await this._hash(this._groupName + ':' + this._sharedSecret + ':' + id);
	}

}

module.exports = WebDH;
