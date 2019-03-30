import fs from 'mz/fs';
import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as buildPackageDetails from '../../../src/package/details';
import * as dependencyInstaller from '../../../src/package/dependencies';
import scaffold from '../../../src/package';

suite('package scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(buildPackageDetails, 'default');
    sandbox.stub(dependencyInstaller, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the package file is created and dependencies are installed', async () => {
    const name = any.string();
    const homepage = any.url();
    const packageDetails = {...any.simpleObject(), name, homepage};
    const projectRoot = any.string();
    const projectName = any.string();
    const visibility = any.word();
    const scope = any.word();
    const projectType = any.word();
    const license = any.string();
    const tests = any.simpleObject();
    const vcs = any.simpleObject();
    const author = any.simpleObject();
    const description = any.sentence();
    const contributors = any.simpleObject();
    buildPackageDetails.default
      .withArgs({
        projectName,
        visibility,
        scope,
        projectType,
        license,
        tests,
        vcs,
        author,
        description,
        contributors
      })
      .resolves(packageDetails);

    assert.deepEqual(
      await scaffold({
        projectRoot,
        projectType,
        contributors,
        projectName,
        visibility,
        scope,
        license,
        tests,
        vcs,
        author,
        description
      }),
      {name, homepage}
    );

    assert.calledWith(fs.writeFile, `${projectRoot}/package.json`, JSON.stringify(packageDetails));
    assert.calledWith(dependencyInstaller.default, {contributors});
  });
});
