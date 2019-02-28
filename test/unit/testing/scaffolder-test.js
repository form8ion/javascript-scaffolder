import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as unitTestingScaffolder from '../../../src/testing/unit';
import * as integrationTestingScaffolder from '../../../src/testing/integration';
import scaffoldTesting from '../../../src/testing/scaffolder';

suite('testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const visibility = any.word();
  const unitTestingDevDependencies = any.listOf(any.string);
  const integrationTestingDevDependencies = any.listOf(any.string);
  const unitTestScripts = any.simpleObject();
  const integrationTestScripts = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(unitTestingScaffolder, 'default');
    sandbox.stub(integrationTestingScaffolder, 'default');

    unitTestingScaffolder.default
      .withArgs({projectRoot, visibility})
      .resolves({...any.simpleObject(), devDependencies: unitTestingDevDependencies, scripts: unitTestScripts});
    integrationTestingScaffolder.default
      .withArgs({projectRoot})
      .resolves({
        ...any.simpleObject(),
        devDependencies: integrationTestingDevDependencies,
        scripts: integrationTestScripts
      });
  });

  teardown(() => sandbox.restore());

  test('that unit testing is scaffolded if the project will be unit tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: true, integration: true}}),
      {
        devDependencies: ['@travi/any', ...unitTestingDevDependencies, ...integrationTestingDevDependencies],
        scripts: {...unitTestScripts, ...integrationTestScripts}
      }
    );
  });

  test('that integration testing is not scaffolded if the project will not be integration tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: true, integration: false}}),
      {devDependencies: ['@travi/any', ...unitTestingDevDependencies], scripts: unitTestScripts}
    );
  });

  test('that unit testing is not scaffolded if the project will not be unit tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: false, integration: true}}),
      {devDependencies: ['@travi/any', ...integrationTestingDevDependencies], scripts: integrationTestScripts}
    );
  });
});
