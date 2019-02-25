import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as unitTestingScaffolder from '../../../src/testing/unit';
import scaffoldTesting from '../../../src/testing/scaffolder';

suite('testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(unitTestingScaffolder, 'default');
  });

  teardown(() => sandbox.restore());

  test('that unit testing is scaffolded if the project will be unit tested', async () => {
    const unitTestingDevDependencies = any.listOf(any.string);
    unitTestingScaffolder.default
      .withArgs({projectRoot})
      .resolves({...any.simpleObject(), devDependencies: unitTestingDevDependencies});

    assert.deepEqual(await scaffoldTesting({projectRoot}), {devDependencies: unitTestingDevDependencies});
  });
});
