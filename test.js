import {PassThrough as PassThroughStream} from 'stream';
import getStream from 'get-stream';
import test from 'ava';
import stripAnsi from 'strip-ansi';
import Ora from '.';

const spinnerChar = process.platform === 'win32' ? '-' : '⠋';
const noop = () => {};

const getPassThroughStream = () => {
	const stream = new PassThroughStream();
	stream.clearLine = noop;
	stream.cursorTo = noop;
	return stream;
};

test('main', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.stop();
	stream.end();

	t.is(await output, `${spinnerChar} foo`);
});

test('title shortcut', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);
	const ora = Ora;

	const spinner = ora('foo');
	spinner.stream = stream;
	spinner.color = false;
	spinner.enabled = true;
	spinner.start();
	spinner.stop();

	stream.end();

	t.is(await output, `${spinnerChar} foo`);
});

test('`.id` is not set when created', t => {
	const spinner = new Ora('foo');
	t.falsy(spinner.id);
});

test('ignore consecutive calls to `.start()`', t => {
	const spinner = new Ora('foo');
	spinner.start();
	const id = spinner.id;
	spinner.start();
	t.is(id, spinner.id);
});

test('chain call to `.start()` with constructor', t => {
	const spinner = new Ora({
		stream: getPassThroughStream(),
		text: 'foo',
		enabled: true
	}).start();

	t.truthy(spinner.id);
	t.true(spinner.enabled);
});

test('succeed', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.succeed();
	stream.end();

	t.regex(stripAnsi(await output), /(✔|√) foo/);
});

test('succeed with new text', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.succeed('fooed');
	stream.end();

	t.regex(stripAnsi(await output), /(✔|√) fooed/);
});

test('warn', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.warn();
	stream.end();

	t.regex(stripAnsi(await output), /⚠ foo/);
});

test('warn with new text', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.warn('fooed');
	stream.end();

	t.regex(stripAnsi(await output), /⚠ fooed/);
});

test('fail', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.fail();
	stream.end();

	t.regex(stripAnsi(await output), /(✖|×) foo/);
});

test('fail with new text', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.fail('failed to foo');
	stream.end();

	t.regex(stripAnsi(await output), /(✖|×) failed to foo/);
});

test('stopAndPersist', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.stopAndPersist('@');
	stream.end();

	t.regex(await output, /@ foo/);
});

test('stopAndPersist with no argument', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.stopAndPersist(' ');
	stream.end();

	t.regex(await output, /\s foo/);
});

test('stopAndPersist with new text', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.stopAndPersist({text: 'all done'});
	stream.end();

	t.regex(await output, /\s all done/);
});

test('stopAndPersist with new symbol and text', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);

	const spinner = new Ora({
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	spinner.start();
	spinner.stopAndPersist({symbol: '@', text: 'all done'});
	stream.end();

	t.regex(await output, /@ all done/);
});

test('promise resolves', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);
	const resolves = Promise.resolve(1);

	Ora.promise(resolves, {
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	await resolves;
	stream.end();

	t.regex(stripAnsi(await output), /(✔|√) foo/);
});

test('promise rejects', async t => {
	const stream = getPassThroughStream();
	const output = getStream(stream);
	const rejects = Promise.reject(new Error());

	Ora.promise(rejects, {
		stream,
		text: 'foo',
		color: false,
		enabled: true
	});

	try {
		await rejects;
	} catch (err) {}

	stream.end();

	t.regex(stripAnsi(await output), /(✖|×) foo/);
});
