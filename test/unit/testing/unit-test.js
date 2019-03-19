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
  const mochaScripts = any.simpleObject();
  const nycDevDependencies = any.listOf(any.string);
  const nycFilesToIgnoreFromVcs = any.listOf(any.string);
  const nycDirectoriesToIgnoreFromVcs = any.listOf(any.string);

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mocha, 'default');
    sandbox.stub(nyc, 'default');

    mocha.default
      .withArgs({projectRoot})
      .resolves({...any.simpleObject(), devDependencies: mochaDevDependencies, scripts: mochaScripts});
    nyc.default
      .withArgs({projectRoot})
      .resolves({
        ...any.simpleObject(),
        devDependencies: nycDevDependencies,
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs}
      });
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot}),
      {
        devDependencies: [...mochaDevDependencies, ...nycDevDependencies],
        scripts: {
          'test:unit': 'nyc run-s test:unit:base',
          ...mochaScripts
        },
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs}
      }
    );
  });

  test('that codecov is installed for public projects', async () => {
    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot, visibility: 'Public'}),
      {
        devDependencies: [...mochaDevDependencies, ...nycDevDependencies, 'codecov'],
        scripts: {
          'test:unit': 'nyc run-s test:unit:base',
          ...mochaScripts,
          'coverage:report': 'nyc report --reporter=text-lcov > coverage.lcov && codecov'
        },
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs}
      }
    );
  });
});
