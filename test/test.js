'use strict';

const assert = require('assert');
const KeepTime = require('keeptime');
const WebDH = require('../webdh');
const group = require('../group');

const N = 100;

(async function() {
	let n = {};
	{
		let sum = 0;
		Object.keys(group).forEach(function(g) { n[g] = 1 / Math.pow(group[g].bits, 2.529); sum += n[g]; });
		let scale = N / (sum / Object.keys(group).length);
		Object.keys(n).forEach(function(g) { n[g] *= scale; n[g] = Math.ceil(Math.max(1, n[g])); });
	}
	console.log('running tests...');
	var kt = new KeepTime();
	for (let g in n) {
		kt.reset()
		kt.start();
		for (let i = 0; i < n[g]; i++) {
			let a, b, ac, bc, ak, bk;
			a = new WebDH(g);
			b = new WebDH(g);
			ac = await a.challenge();
			await b.generate(ac);
			bc = await b.challenge();
			await a.generate(bc);
			ak = await a.secret();
			bk = await b.secret();
			assert(ak === bk);
			ak = await a.key();
			bk = await b.key();
			assert(ak === bk);
			ak = await a.key(1);
			bk = await b.key(1);
			assert(ak === bk);
			ak = await a.key('foo');
			bk = await b.key('foo');
			assert(ak === bk);
			ak = await a.key('kukkuu1');
			bk = await b.key('kukkuu2');
			assert(ak !== bk);
		}
		kt.stop();
		console.log('group:', g, 'tests:', n[g], 'time:', kt.get());
	}
})();
