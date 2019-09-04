import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldRemark from '../../../src/linting/remark';

suite('remark config scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the config is written and dependencies are defined', async () => {
    const config = any.string();
    const projectRoot = any.string();

    assert.deepEqual(
      await scaffoldRemark({config, projectRoot, vcs: any.simpleObject()}),
      {devDependencies: [config, 'remark-cli'], scripts: {'lint:md': 'remark . --frail'}}
    );
    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.remarkrc.js`,
      `exports.plugins = [
  '${config}'
];`
    );
  });

  test('that the config configures validate-links when the project will not be versioned', async () => {
    const config = any.string();
    const projectRoot = any.string();

    await scaffoldRemark({config, projectRoot, vcs: undefined});
    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.remarkrc.js`,
      `exports.plugins = [
  '${config}',
  ['validate-links', {repository: false}]
];`
    );
  });
});
