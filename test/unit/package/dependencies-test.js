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
  const defaultDevDependencies = [
    'npm-run-all',
    commonDependency,
    ...devDependenciesFromAllContributors
  ];

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(dependencyInstaller, 'default');
  });

  teardown(() => sandbox.restore());

  test('that devDependencies get installed', async () => {
    await installDependencies({contributors});

    assert.calledWith(dependencyInstaller.default, defaultDevDependencies);
  });

  test('that ban-sensitive-files gets installed when the project will be versioned', async () => {
    await installDependencies({contributors, vcs: any.simpleObject()});

    assert.calledWith(dependencyInstaller.default, [...defaultDevDependencies, 'ban-sensitive-files']);
  });

  test('that additional devDependencies get installed for package type projects', async () => {
    await installDependencies({projectType: 'Package', contributors});

    assert.calledWith(
      dependencyInstaller.default,
      [...defaultDevDependencies, 'rimraf', 'rollup', 'rollup-plugin-auto-external']
    );
  });
});
