import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as mocha from './mocha';
import * as nyc from '../config/nyc';
import scaffoldUnitTesting from './unit';

suite('unit testing scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const mochaDevDependencies = any.listOf(any.string);
  const mochaScripts = any.simpleObject();
  const mochaEslintConfigs = any.listOf(any.string);
  const mochaNextSteps = any.listOf(any.simpleObject);
  const nycDevDependencies = any.listOf(any.string);
  const nycFilesToIgnoreFromVcs = any.listOf(any.string);
  const nycDirectoriesToIgnoreFromVcs = any.listOf(any.string);
  const vcs = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(mocha, 'default');
    sandbox.stub(nyc, 'default');

    mocha.default
      .withArgs({projectRoot})
      .resolves({
        devDependencies: mochaDevDependencies,
        scripts: mochaScripts,
        eslintConfigs: mochaEslintConfigs,
        nextSteps: mochaNextSteps
      });
  });

  teardown(() => sandbox.restore());

  test('that mocha is scaffolded', async () => {
    const visibility = any.word();
    nyc.default
      .withArgs({projectRoot, vcs, visibility})
      .resolves({
        devDependencies: nycDevDependencies,
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs}
      });

    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot, vcs, visibility}),
      {
        devDependencies: [...mochaDevDependencies, ...nycDevDependencies],
        scripts: {
          'test:unit': 'nyc run-s test:unit:base',
          ...mochaScripts
        },
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs},
        eslintConfigs: mochaEslintConfigs,
        nextSteps: mochaNextSteps
      }
    );
  });

  test('that codecov is installed for public projects', async () => {
    const visibility = 'Public';
    const nycStatusBadges = any.simpleObject();
    nyc.default
      .withArgs({projectRoot, vcs, visibility})
      .resolves({
        devDependencies: nycDevDependencies,
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs},
        badges: {status: nycStatusBadges}
      });

    assert.deepEqual(
      await scaffoldUnitTesting({projectRoot, visibility, vcs}),
      {
        devDependencies: ['codecov', ...mochaDevDependencies, ...nycDevDependencies],
        scripts: {
          'test:unit': 'nyc run-s test:unit:base',
          ...mochaScripts,
          'coverage:report': 'nyc report --reporter=text-lcov > coverage.lcov && codecov'
        },
        badges: {status: nycStatusBadges},
        vcsIgnore: {files: nycFilesToIgnoreFromVcs, directories: nycDirectoriesToIgnoreFromVcs},
        eslintConfigs: mochaEslintConfigs,
        nextSteps: mochaNextSteps
      }
    );
  });
});
