import fs from 'mz/fs';
import {assert} from 'chai';
import sinon from 'sinon';
import any from '@travi/any';
import scaffoldHusky from './husky';

suite('husky config', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the config file is created', async () => {
    assert.deepEqual(
      await scaffoldHusky({projectRoot}),
      {devDependencies: ['husky'], scripts: {}, vcsIgnore: {files: [], directories: []}}
    );

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.huskyrc.json`,
      JSON.stringify({hooks: {'pre-commit': 'npm test', 'commit-msg': 'commitlint -e'}})
    );
  });
});
