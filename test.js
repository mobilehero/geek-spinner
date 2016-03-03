import test from 'ava';
import hookStd from 'hook-std';
import Ora from './';

test(t => {
	// TODO: use the the `stream` option instead of hooking stderr

	process.stderr.isTTY = true;
	process.stderr.clearLine = function () {};
	process.stderr.cursorTo = function () {};

	const spinner = new Ora({text: 'foo', color: false});

	spinner.enabled = true;

	let out = '';

	const unhook = hookStd.stderr({silent: true}, output => {
		out += output;
	});

	spinner.start();

	t.is(out, '⠋ foo');

	spinner.stop();
	unhook();
});
