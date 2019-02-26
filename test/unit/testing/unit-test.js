import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as mocha from '../../../src/testing/mocha';
import * as nyc from '../../../src/config/nyc';
import scaffoldUnitTesting from '../../../src/testing/unit';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const mochaDevDependencies = any.listOf(any.string);
  const nycDevDependencies = any.listOf(any.string);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mocha, 'default');
    sandbox.stub(nyc, 'default');

    mocha.default.withArgs({projectRoot}).resolves({...any.simpleObject(), devDependencies: mochaDevDependencies});
    nyc.default.withArgs({projectRoot}).resolves({...any.simpleObject(), devDependencies: nycDevDependencies});
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot}),
      {devDependencies: [...mochaDevDependencies, ...nycDevDependencies, '@travi/any']}
    );
  });

  test('that codecov is installed for public projects', async () => {
    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot, visibility: 'Public'}),
      {devDependencies: [...mochaDevDependencies, ...nycDevDependencies, '@travi/any', 'codecov']}
    );
  });
});
