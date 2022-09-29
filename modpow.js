'use strict';

function modPow(a, b, n) {
	a %= n;
	let r = 1n;
	while (b > 0n) {
		let lsb = b & 1n;
		b >>= 1n;
		if (lsb == 1n) {
			r *= a;
			r %= n;
		}
		a *= a;
		a %= n;
	}
	return r;
}

module.exports = modPow;
