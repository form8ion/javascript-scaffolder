import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as cucumber from '../../../src/testing/cucumber';
import scaffoldIntegrationTesting from '../../../src/testing/integration';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const cucumberDevDependencies = any.listOf(any.string);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(cucumber, 'default');
  });

  teardown(() => sandbox.restore());

  test('that cucumber is scaffolded', async () => {
    cucumber.default
      .withArgs({projectRoot})
      .resolves({...any.simpleObject(), devDependencies: cucumberDevDependencies});

    assert.deepEqual(await scaffoldIntegrationTesting({projectRoot}), {devDependencies: cucumberDevDependencies});
  });
});
