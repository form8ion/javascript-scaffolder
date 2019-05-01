import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as dependencyInstaller from '../../../src/package/install';
import installDependencies from '../../../src/package/dependencies';

suite('dependencies', () => {
  let sandbox;
  const dependenciesLists = any.listOf(() => any.fromList([any.listOf(any.string), undefined]), {min: 5});
  const dependenciesFromAllContributors = dependenciesLists.reduce((acc, list) => (list ? [...acc, ...list] : acc), []);
  const devDependenciesLists = any.listOf(() => any.listOf(any.string), {min: 5});
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

    assert.calledWith(dependencyInstaller.default, dependenciesFromAllContributors, 'prod');
    assert.calledWith(dependencyInstaller.default, defaultDevDependencies, 'dev');
  });
});
