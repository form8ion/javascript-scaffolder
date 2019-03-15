import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as dependencyInstaller from '../../../src/package/install';
import installDependencies from '../../../src/package/dependencies';

suite('dependencies', () => {
  let sandbox;
  const devDependenciesLists = any.listOf(() => any.listOf(any.string));
  const devDependenciesFromAllContributors = devDependenciesLists.reduce((acc, list) => ([...acc, ...list]), []);
  const contributors = any.listOf(
    index => ({...any.simpleObject(), devDependencies: devDependenciesLists[index]}),
    {size: devDependenciesLists.length}
  );
  const defaultDevDependencies = ['npm-run-all', 'ban-sensitive-files', ...devDependenciesFromAllContributors];

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(dependencyInstaller, 'default');
  });

  teardown(() => sandbox.restore());

  test('that devDependencies get installed', async () => {
    await installDependencies({contributors});

    assert.calledWith(dependencyInstaller.default, defaultDevDependencies);
  });

  test('that additional devDependencies get installed for package type projects', async () => {
    await installDependencies({projectType: 'Package', contributors});

    assert.calledWith(
      dependencyInstaller.default,
      [...defaultDevDependencies, 'rimraf', 'rollup', 'rollup-plugin-auto-external']
    );
  });
});
