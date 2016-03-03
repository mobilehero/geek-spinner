'use strict';
var Ora = require('./');

var spinner = new Ora({
	text: 'Loading unicorns',
	spinner: process.argv[2]
});

spinner.start();

setTimeout(() => {
	spinner.color = 'yellow';
	spinner.text = 'Loading rainbows';
}, 1000);

// $ node example.js nameOfSpinner
