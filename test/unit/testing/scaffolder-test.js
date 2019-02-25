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

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(unitTestingScaffolder, 'default');
    sandbox.stub(integrationTestingScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that unit testing is scaffolded if the project will be unit tested', async () => {
    unitTestingScaffolder.default
      .withArgs({projectRoot, visibility})
      .resolves({...any.simpleObject(), devDependencies: unitTestingDevDependencies});

    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {unit: true}}),
      {devDependencies: unitTestingDevDependencies}
    );
  });

  test('that integration testing is scaffolded if the project will be integration tested', async () => {
    integrationTestingScaffolder.default
      .withArgs({projectRoot})
      .resolves({...any.simpleObject(), devDependencies: integrationTestingDevDependencies});

    assert.deepEqual(
      await scaffoldTesting({projectRoot, visibility, tests: {integration: true}}),
      {devDependencies: integrationTestingDevDependencies}
    );
  });

  test('that scaffolding is not performed if the project will not be tested', async () => {
    assert.deepEqual(
      await scaffoldTesting({projectRoot, tests: {unit: false, integration: false}}),
      {devDependencies: []}
    );
    assert.notCalled(unitTestingScaffolder.default);
  });
});
