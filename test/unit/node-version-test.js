import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import {determineLatestVersionOf, install} from '../../src/node-version';

suite('node version', () => {
  let sandbox;
  const version = `v${any.integer()}.${any.integer()}.${any.integer()}`;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(exec, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the latest node version is returned when latest is requested', async () => {
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote')
      .resolves([...any.listOf(any.word), version, ''].join('\n'));

    assert.equal(await determineLatestVersionOf(any.word()), version);
  });

  test('that the latest lts node version is returned when LTS is requested', async () => {
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote --lts')
      .resolves([...any.listOf(any.word), version, ''].join('\n'));

    assert.equal(await determineLatestVersionOf('LTS'), version);
  });

  test('that the node version gets installed', async () => {
    await install(any.word());

    assert.calledWith(exec.default, '. ~/.nvm/nvm.sh && nvm install', {silent: false});
  });
});
