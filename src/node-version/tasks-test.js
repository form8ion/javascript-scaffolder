import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as execa from '../../third-party-wrappers/execa';
import {determineLatestVersionOf, install} from './tasks';

suite('node-version tasks', () => {
  let sandbox;
  const majorVersion = any.integer();
  const version = `v${majorVersion}.${any.integer()}.${any.integer()}`;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(execa, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the latest node version is returned when latest is requested', async () => {
    execa.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote', {shell: true})
      .resolves({stdout: [...any.listOf(any.word), version, ''].join('\n')});

    assert.equal(await determineLatestVersionOf(any.word()), `v${majorVersion}`);
  });

  test('that the latest lts node version is returned when LTS is requested', async () => {
    execa.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote --lts', {shell: true})
      .resolves({stdout: [...any.listOf(any.word), version, ''].join('\n')});

    assert.equal(await determineLatestVersionOf('LTS'), `v${majorVersion}`);
  });

  test('that the node version gets installed', async () => {
    const pipe = sinon.spy();
    execa.default.withArgs('. ~/.nvm/nvm.sh && nvm install', {shell: true}).returns({stdout: {pipe}});

    await install();

    assert.calledWith(pipe, process.stdout);
  });
});
