import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as dependencyInstaller from './install';
import installDependencies from './dependencies';
import {PROD_DEPENDENCY_TYPE} from './install';
import {DEV_DEPENDENCY_TYPE} from './install';

suite('dependencies', () => {
  let sandbox;
  const dependenciesLists = any.listOf(() => any.fromList([any.listOf(any.string), undefined]), {min: 5});
  const dependenciesFromAllContributors = dependenciesLists.reduce((acc, list) => (list ? [...acc, ...list] : acc), []);
  const devDependenciesLists = any.listOf(() => any.listOf(any.string), {size: dependenciesLists.length});
  const devDependenciesFromAllContributors = devDependenciesLists.reduce((acc, list) => ([...acc, ...list]), []);
  const contributors = any.listOf(
    index => ({
      ...any.simpleObject(),
      dependencies: dependenciesLists[index],
      devDependencies: devDependenciesLists[index]
    }),
    {size: devDependenciesLists.length}
  );
  const defaultDevDependencies = ['npm-run-all', ...devDependenciesFromAllContributors];

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(dependencyInstaller, 'default');
  });

  teardown(() => sandbox.restore());

  test('that dependencies get installed', async () => {
    await installDependencies({contributors});

    assert.calledWith(dependencyInstaller.default, dependenciesFromAllContributors, PROD_DEPENDENCY_TYPE);
    assert.calledWith(dependencyInstaller.default, defaultDevDependencies, DEV_DEPENDENCY_TYPE);
  });

  test('that a contirbutor without `devDependencies` does not throw an error', async () => {
    await installDependencies({contributors: [...contributors, any.simpleObject()]});
  });
});
