import {promises as fsPromises} from 'fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import * as nodeVersionTasks from './tasks';
import scaffoldNodeVersion from './index';

suite('node-version scaffolder', () => {
  const projectRoot = any.string();
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(nodeVersionTasks, 'determineLatestVersionOf');
    sandbox.stub(nodeVersionTasks, 'install');
    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that mvn is configured with the desired version', async () => {
    const nodeVersionCategory = any.word();
    const version = any.word();
    nodeVersionTasks.determineLatestVersionOf.withArgs(nodeVersionCategory).resolves(version);

    assert.equal(await scaffoldNodeVersion({projectRoot, nodeVersionCategory}), version);
    assert.calledWith(nodeVersionTasks.install, nodeVersionCategory);
    assert.calledWith(fsPromises.writeFile, `${projectRoot}/.nvmrc`, version);
  });
});
