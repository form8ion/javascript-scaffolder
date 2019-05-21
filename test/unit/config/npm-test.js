import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldNpmConfig from '../../../src/config/npm';

suite('npm config scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that applications save exact versions of dependencies', async () => {
    await scaffoldNpmConfig({projectRoot, projectType: 'Application'});

    assert.calledWith(fs.writeFile, `${projectRoot}/.npmrc`, 'update-notifier=false\nsave-exact=true\n');
  });

  test('that cli-applications save exact versions of dependencies', async () => {
    await scaffoldNpmConfig({projectRoot, projectType: 'CLI'});

    assert.calledWith(fs.writeFile, `${projectRoot}/.npmrc`, 'update-notifier=false\nsave-exact=true\n');
  });

  test('that packages are allowed to use semver ranges', async () => {
    await scaffoldNpmConfig({projectRoot, projectType: 'Package'});

    assert.calledWith(fs.writeFile, `${projectRoot}/.npmrc`, 'update-notifier=false\n');
  });
});
