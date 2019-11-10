import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import {determineLatestVersionOf, install} from './tasks';

suite('node-version tasks', () => {
  let sandbox;
  const majorVersion = any.integer();
  const version = `v${majorVersion}.${any.integer()}.${any.integer()}`;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(exec, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the latest node version is returned when latest is requested', async () => {
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote')
      .resolves([...any.listOf(any.word), version, ''].join('\n'));

    assert.equal(await determineLatestVersionOf(any.word()), `v${majorVersion}`);
  });

  test('that the latest lts node version is returned when LTS is requested', async () => {
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote --lts')
      .resolves([...any.listOf(any.word), version, ''].join('\n'));

    assert.equal(await determineLatestVersionOf('LTS'), `v${majorVersion}`);
  });

  test('that the node version gets installed', async () => {
    await install();

    assert.calledWith(exec.default, '. ~/.nvm/nvm.sh && nvm install', {silent: false});
  });
});
