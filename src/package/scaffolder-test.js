import {promises as fsPromises} from 'fs';
import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as buildPackageDetails from './details';
import scaffold from './index';

suite('package scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
    sandbox.stub(buildPackageDetails, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the package file is created and dependencies are installed', async () => {
    const packageName = any.string();
    const homepage = any.url();
    const packageDetails = {...any.simpleObject(), homepage};
    const projectRoot = any.string();
    const projectType = any.word();
    const license = any.string();
    const vcs = any.simpleObject();
    const author = any.simpleObject();
    const description = any.sentence();
    const contributors = any.simpleObject();
    const packageProperties = any.simpleObject();
    const pathWithinParent = any.string();
    buildPackageDetails.default
      .withArgs({
        packageName,
        projectType,
        license,
        vcs,
        author,
        description,
        contributors,
        packageProperties,
        pathWithinParent
      })
      .resolves(packageDetails);

    assert.deepEqual(
      await scaffold({
        projectRoot,
        projectType,
        contributors,
        packageName,
        license,
        vcs,
        author,
        description,
        packageProperties,
        pathWithinParent
      }),
      {homepage}
    );

    assert.calledWith(fsPromises.writeFile, `${projectRoot}/package.json`, JSON.stringify(packageDetails));
  });
});
