import sinon from 'sinon';
import any from '@travi/any';
import {assert} from 'chai';
import * as packageTypeScaffolder from './package/scaffolder';
import * as applicationTypeScaffolder from './application';
import * as cliTypeScaffolder from './cli';
import projectTypeScaffolder from './index';

suite('project-type scaffolder', () => {
  let sandbox;
  const results = any.simpleObject();
  const projectRoot = any.string();
  const transpileLint = any.boolean();
  const packageName = any.word();
  const visibility = any.word();
  const tests = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(packageTypeScaffolder, 'default');
    sandbox.stub(applicationTypeScaffolder, 'default');
    sandbox.stub(cliTypeScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the package-type scaffolder is applied when the project-type is `Package`', async () => {
    const scope = any.word();
    const packageTypes = any.simpleObject();

    packageTypeScaffolder.default
      .withArgs({projectRoot, transpileLint, packageName, visibility, scope, packageTypes, tests})
      .resolves(results);

    assert.equal(
      await projectTypeScaffolder({
        projectType: 'Package',
        projectRoot,
        transpileLint,
        packageName,
        visibility,
        scope,
        packageTypes,
        tests
      }),
      results
    );
  });

  test('that the application-type scaffolder is applied when the project-type is `Application`', async () => {
    const applicationTypes = any.simpleObject();
    const projectName = any.word();
    applicationTypeScaffolder.default
      .withArgs({projectRoot, projectName, transpileLint, applicationTypes, tests})
      .resolves(results);

    assert.equal(
      await projectTypeScaffolder({
        projectType: 'Application',
        projectRoot,
        projectName,
        transpileLint,
        applicationTypes,
        tests
      }),
      results
    );
  });

  test('that the application-type scaffolder is applied when the project-type is `CLI`', async () => {
    cliTypeScaffolder.default.withArgs({packageName, visibility}).resolves(results);

    assert.equal(await projectTypeScaffolder({projectType: 'CLI', packageName, visibility}), results);
  });

  test('that an error is thrown for an unknown project-type', () => {
    const projectType = any.word();

    assert.throws(() => projectTypeScaffolder({projectType}), `The project-type of ${projectType} is invalid`);
  });
});
