import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as commitlintScaffolder from '../../../src/commit-convention/commitlint';
import scaffoldCommitConvention from '../../../src/commit-convention';

suite('commit-convention scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(commitlintScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the convention is configured', async () => {
    const commitlintConfig = any.simpleObject();
    const commitlintDevDependencies = any.listOf(any.string);
    commitlintScaffolder.default
      .withArgs({projectRoot, config: commitlintConfig})
      .resolves({devDependencies: commitlintDevDependencies});

    assert.deepEqual(
      await scaffoldCommitConvention({projectRoot, configs: {commitlint: commitlintConfig}}),
      {devDependencies: commitlintDevDependencies, scripts: {}, vcsIgnore: {files: [], directories: []}}
    );
  });

  test('that commitlint is not configured if no config is provided', async () => {
    assert.deepEqual(
      await scaffoldCommitConvention({projectRoot, configs: {}}),
      {devDependencies: [], scripts: {}, vcsIgnore: {files: [], directories: []}}
    );
    assert.notCalled(commitlintScaffolder.default);
  });
});
