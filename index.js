'use strict';
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const cliSpinners = require('cli-spinners');
const logSymbols = require('log-symbols');
const stripAnsi = require('strip-ansi');
const wcwidth = require('wcwidth');
const figures = require('figures');

class Ora {
	constructor(options) {
		if (typeof options === 'string') {
			options = { text: options  };
		}

		this.options = Object.assign({
			text:   '',
			color:  'cyan',
			stream: process.stderr,
		}, options);

		this.baseIndent = this.options.baseIndent || 0;

		const sp = this.options.spinner;
		this.spinner = typeof sp === 'object' ? sp : (process.platform === 'win32' ? cliSpinners.line : (cliSpinners[sp] || cliSpinners.dots)); // eslint-disable-line no-nested-ternary

		if (this.spinner.frames === undefined) {
			throw new Error('Spinner must define `frames`');
		}

		this.text = this.options.text;
		this.color = this.options.color;
		this.interval = this.options.interval || this.spinner.interval || 100;
		this.stream = this.options.stream;
		this.id = null;
		this.frameIndex = 0;
		this.indent = this.baseIndent;
		this.enabled = this.options.enabled || ((this.stream && this.stream.isTTY) && !process.env.CI);
	}
	frame() {
		const { frames } = this.spinner;
		let frame = frames[this.frameIndex];

		if (this.color) {
			frame = chalk[this.color](frame);
		}

		this.frameIndex = ++this.frameIndex % frames.length;

		return `${frame} ${this.text}`;
	}
	clear() {
		if (!this.enabled) {
			return this;
		}

		this.stream.clearLine();
		this.stream.cursorTo(parseInt(this.indent) * 4);

		return this;
	}
	render() {
		this.clear();
		this.stream.write(this.frame());

		return this;
	}
	start(text, indent) {
		if (!this.enabled || this.id) {
			return this;
		}

		indent && (this.indent = indent);

		cliCursor.hide(this.stream);
		this.render();
		this.id = setInterval(this.render.bind(this), this.interval);
		text && (this.text = text);

		return this;
	}
	stop(symbol, text, indent) {
		if (!this.enabled) {
			return this;
		}

		indent && (this.indent = indent);
		clearInterval(this.id);
		this.id = null;
		this.frameIndex = 0;
		this.clear();
		cliCursor.show(this.stream);

		text && (this.text = text);
		this.stream.write(`${symbol || ' '} ${this.text}\n`);

		this.indent = this.baseIndent;
		return this;
	}
	succeed(text, indent) {
		return this.stop(logSymbols.success, text, indent);
	}
	fail(text, indent) {
		return this.stop(logSymbols.error, text, indent);
	}
	info(text, indent) {
		return this.stop(figures.arrowRight, text, indent);
	}
	note(text, indent) {
		!text && (text = this.text);
		text = chalk.gray(text);
		return this.stop(figures.pointerSmall, text, indent);
	}
	skip(text, indent) {
		!text && (text = this.text);
		text += chalk.gray(' [skipped]');
		return this.stop(chalk.yellow(figures.cross), text, indent);
	}
}

module.exports = function (opts) {
	return new Ora(opts);
};

module.exports.promise = (action, options) => {
	if (typeof action.then !== 'function') {
		throw new Error('Parameter `action` must be a Promise');
	}

	const spinner = new Ora(options);
	spinner.start();

	action.then(
		() => {
			spinner.succeed();
		},
		() => {
			spinner.fail();
		}
	);

	return spinner;
};
