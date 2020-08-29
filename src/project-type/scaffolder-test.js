import {projectTypes} from '@form8ion/javascript-core';
import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as packageTypeScaffolder from './package/scaffolder';
import * as applicationTypeScaffolder from './application';
import * as cliTypeScaffolder from './cli';
import * as commonDetailsScaffolder from './common';
import projectTypeScaffolder from './index';

suite('project-type scaffolder', () => {
  let sandbox;
  const results = any.simpleObject();
  const projectRoot = any.string();
  const transpileLint = any.boolean();
  const projectName = any.word();
  const packageName = any.word();
  const visibility = any.word();
  const tests = any.simpleObject();
  const decisions = any.simpleObject();
  const commonDetails = any.simpleObject();
  const vcs = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(packageTypeScaffolder, 'default');
    sandbox.stub(applicationTypeScaffolder, 'default');
    sandbox.stub(cliTypeScaffolder, 'default');
    sandbox.stub(commonDetailsScaffolder, 'default');

    commonDetailsScaffolder.default.withArgs(visibility, vcs).returns(commonDetails);
  });

  teardown(() => sandbox.restore());

  test('that the package-type scaffolder is applied when the project-type is `Package`', async () => {
    const scope = any.word();
    const packageTypes = any.simpleObject();

    packageTypeScaffolder.default
      .withArgs({
        projectRoot,
        transpileLint,
        packageName,
        projectName,
        visibility,
        scope,
        packageTypes,
        tests,
        vcs,
        decisions
      })
      .resolves(results);

    assert.deepEqual(
      await projectTypeScaffolder({
        projectType: projectTypes.PACKAGE,
        projectRoot,
        transpileLint,
        projectName,
        packageName,
        visibility,
        scope,
        packageTypes,
        tests,
        vcs,
        decisions
      }),
      {
        ...commonDetails,
        ...results
      }
    );
  });

  test('that the application-type scaffolder is applied when the project-type is `Application`', async () => {
    const applicationTypes = any.simpleObject();
    applicationTypeScaffolder.default
      .withArgs({projectRoot, projectName, packageName, transpileLint, applicationTypes, tests, decisions})
      .resolves(results);

    assert.deepEqual(
      await projectTypeScaffolder({
        projectType: projectTypes.APPLICATION,
        projectRoot,
        projectName,
        packageName,
        transpileLint,
        applicationTypes,
        tests,
        decisions,
        visibility,
        vcs
      }),
      {
        ...commonDetails,
        ...results
      }
    );
  });

  test('that the application-type scaffolder is applied when the project-type is `CLI`', async () => {
    cliTypeScaffolder.default.withArgs({packageName, visibility, projectRoot}).resolves(results);

    assert.deepEqual(
      await projectTypeScaffolder({projectType: projectTypes.CLI, packageName, visibility, vcs, projectRoot}),
      {...commonDetails, ...results}
    );
  });

  test('that an error is thrown for an unknown project-type', () => {
    const projectType = any.word();

    return assert.isRejected(projectTypeScaffolder({projectType}), `The project-type of ${projectType} is invalid`);
  });
});
