import * as cucumber from '@form8ion/cucumber-scaffolder';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import scaffoldIntegrationTesting from './integration';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(cucumber, 'scaffold');
  });

  teardown(() => sandbox.restore());

  test('that cucumber is scaffolded', async () => {
    const cucumberResult = any.simpleObject();
    cucumber.scaffold.withArgs({projectRoot}).resolves(cucumberResult);

    assert.deepEqual(await scaffoldIntegrationTesting({projectRoot}), cucumberResult);
  });
});
