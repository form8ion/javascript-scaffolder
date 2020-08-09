import * as jsCore from '@form8ion/javascript-core';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import installDependencies from './dependencies';

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

    sandbox.stub(jsCore, 'installDependencies');
  });

  teardown(() => sandbox.restore());

  test('that dependencies get installed', async () => {
    await installDependencies({contributors});

    assert.calledWith(jsCore.installDependencies, dependenciesFromAllContributors, jsCore.PROD_DEPENDENCY_TYPE);
    assert.calledWith(jsCore.installDependencies, defaultDevDependencies, jsCore.DEV_DEPENDENCY_TYPE);
  });

  test('that a contirbutor without `devDependencies` does not throw an error', async () => {
    await installDependencies({contributors: [...contributors, any.simpleObject()]});
  });
});
