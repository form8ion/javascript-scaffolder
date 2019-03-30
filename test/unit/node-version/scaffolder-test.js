import fs from 'mz/fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import * as nodeVersionTasks from '../../../src/node-version/tasks';
import scaffoldNodeVersion from '../../../src/node-version';

suite('node-version scaffolder', () => {
  const projectRoot = any.string();
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(nodeVersionTasks, 'determineLatestVersionOf');
    sandbox.stub(nodeVersionTasks, 'install');
    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that mvn is configured with the desired version', async () => {
    const nodeVersionCategory = any.word();
    const version = any.word();
    nodeVersionTasks.determineLatestVersionOf.withArgs(nodeVersionCategory).resolves(version);

    assert.equal(await scaffoldNodeVersion({projectRoot, nodeVersionCategory}), version);
    assert.calledWith(nodeVersionTasks.install, nodeVersionCategory);
    assert.calledWith(fs.writeFile, `${projectRoot}/.nvmrc`, version);
  });
});
