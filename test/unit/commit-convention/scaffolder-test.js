import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as huskyScaffolder from '../../../src/config/husky';
import * as commitizenScaffolder from '../../../src/config/commitizen';
import * as commitlintScaffolder from '../../../src/commit-convention/commitlint';
import scaffoldCommitConvention from '../../../src/commit-convention';

suite('commit-convention scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const commitizenScripts = any.simpleObject();
  const commitizenDevDependencies = any.listOf(any.string);
  const huskyScripts = any.simpleObject();
  const huskyDevDependencies = any.listOf(any.string);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(commitlintScaffolder, 'default');
    sandbox.stub(huskyScaffolder, 'default');
    sandbox.stub(commitizenScaffolder, 'default');

    huskyScaffolder.default
      .withArgs({projectRoot})
      .resolves({devDependencies: huskyDevDependencies, scripts: huskyScripts});
    commitizenScaffolder.default
      .withArgs({projectRoot})
      .resolves({devDependencies: commitizenDevDependencies, scripts: commitizenScripts});
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
      {
        devDependencies: [...commitizenDevDependencies, ...huskyDevDependencies, ...commitlintDevDependencies],
        scripts: {...commitizenScripts, ...huskyScripts},
        vcsIgnore: {files: [], directories: []}
      }
    );
  });

  test('that commitlint is not configured if no config is provided', async () => {
    assert.deepEqual(
      await scaffoldCommitConvention({projectRoot, configs: {}}),
      {
        devDependencies: [...commitizenDevDependencies, ...huskyDevDependencies],
        scripts: {...commitizenScripts, ...huskyScripts},
        vcsIgnore: {files: [], directories: []}
      }
    );
    assert.notCalled(commitlintScaffolder.default);
  });
});
