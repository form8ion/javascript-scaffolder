import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as mocha from '../../../src/testing/mocha';
import scaffoldUnitTesting from '../../../src/testing/unit';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mocha, 'default');
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    const mochaDevDependencies = any.listOf(any.string);
    mocha.default.withArgs({projectRoot}).resolves({...any.simpleObject(), devDependencies: mochaDevDependencies});

    assert.deepEqual(await scaffoldUnitTesting({projectRoot}), {devDependencies: mochaDevDependencies});
  });
});
