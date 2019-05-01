import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as dependencyInstaller from '../../../src/package/install';
import installDependencies from '../../../src/package/dependencies';

suite('dependencies', () => {
  let sandbox;
  const devDependenciesLists = any.listOf(() => any.listOf(any.string), {min: 5});
  const devDependenciesFromAllContributors = devDependenciesLists.reduce((acc, list) => ([...acc, ...list]), []);
  const commonDependency = any.string();
  devDependenciesLists[0].unshift(commonDependency);
  devDependenciesLists[4].unshift(commonDependency);
  const contributors = any.listOf(
    index => ({...any.simpleObject(), devDependencies: devDependenciesLists[index]}),
    {size: devDependenciesLists.length}
  );
  const defaultDevDependencies = ['npm-run-all', commonDependency, ...devDependenciesFromAllContributors];

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(dependencyInstaller, 'default');
  });

  teardown(() => sandbox.restore());

  test('that devDependencies get installed', async () => {
    await installDependencies({contributors});

    assert.calledWith(dependencyInstaller.default, defaultDevDependencies, 'dev');
  });
});
