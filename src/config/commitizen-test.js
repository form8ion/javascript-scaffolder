import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffold from './commitizen';

suite('commitizen', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the config file is written and dependencies are returned', async () => {
    const projectRoot = any.string();

    const result = await scaffold({projectRoot});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.czrc`,
      JSON.stringify({path: './node_modules/cz-conventional-changelog'})
    );
    assert.deepEqual(
      result,
      {devDependencies: ['cz-conventional-changelog'], scripts: {}, vcsIgnore: {files: [], directories: []}}
    );
  });
});
