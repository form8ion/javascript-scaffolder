import {promises as fsPromises} from 'fs';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import scaffoldHusky from './husky';

suite('husky config', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the config file is created', async () => {
    assert.deepEqual(
      await scaffoldHusky({projectRoot}),
      {devDependencies: ['husky'], scripts: {}, vcsIgnore: {files: [], directories: []}}
    );

    assert.calledWith(
      fsPromises.writeFile,
      `${projectRoot}/.huskyrc.json`,
      JSON.stringify({hooks: {'pre-commit': 'npm test', 'commit-msg': 'commitlint --edit'}})
    );
  });
});
