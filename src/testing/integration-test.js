import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as cucumber from './cucumber';
import scaffoldIntegrationTesting from './integration';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(cucumber, 'default');
  });

  teardown(() => sandbox.restore());

  test('that cucumber is scaffolded', async () => {
    const cucumberResult = any.simpleObject();
    cucumber.default.withArgs({projectRoot}).resolves(cucumberResult);

    assert.deepEqual(await scaffoldIntegrationTesting({projectRoot}), cucumberResult);
  });
});
