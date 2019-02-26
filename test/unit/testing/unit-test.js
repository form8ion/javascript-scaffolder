import fs from 'mz/fs';
import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as mocha from '../../../src/testing/mocha';
import scaffoldUnitTesting from '../../../src/testing/unit';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const mochaDevDependencies = any.listOf(any.string);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mocha, 'default');
    sandbox.stub(fs, 'writeFile');

    mocha.default.withArgs({projectRoot}).resolves({...any.simpleObject(), devDependencies: mochaDevDependencies});
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    assert.deepEqual(await scaffoldUnitTesting({projectRoot}), {devDependencies: mochaDevDependencies});
    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.nycrc`,
      JSON.stringify({reporter: ['lcov', 'text-summary'], exclude: ['test/']})
    );
  });

  test('that codecov is installed for public projects', async () => {
    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot, visibility: 'Public'}),
      {devDependencies: [...mochaDevDependencies, 'codecov', 'nyc', '@travi/any']}
    );
  });
});
