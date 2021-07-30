import * as jsCore from '@form8ion/javascript-core';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import * as monorepoChooser from './prompt';
import scaffoldMonorepo from './monorepo';

suite('monorepo project-type', () => {
  let sandbox;
  const projectRoot = any.string();
  const monorepoTypes = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(monorepoChooser, 'default');
    sandbox.stub(jsCore, 'scaffoldChoice');
  });

  teardown(() => sandbox.restore());

  test('that details specific to a monorepo project-type are scaffolded', async () => {
    const chosenMonorepoType = any.word();
    const decisions = any.simpleObject();
    const typeScaffoldingResults = any.simpleObject();
    const packageManager = any.word();
    monorepoChooser.default
      .withArgs({types: monorepoTypes, projectType: jsCore.projectTypes.MONOREPO, decisions})
      .resolves(chosenMonorepoType);
    jsCore.scaffoldChoice
      .withArgs(monorepoTypes, chosenMonorepoType, {projectRoot, packageManager})
      .resolves(typeScaffoldingResults);

    assert.deepEqual(
      await scaffoldMonorepo({monorepoTypes, decisions, projectRoot, packageManager}),
      {eslintConfigs: [], packageProperties: {private: true}, ...typeScaffoldingResults}
    );
  });
});
