import {promises as fsPromises} from 'fs';
import * as eslint from '@form8ion/eslint';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldEsLint from './eslint';

suite('eslint config scaffolder', () => {
  let sandbox;
  const packageName = any.word();
  const scope = any.string();
  const projectRoot = any.string();
  const buildDirectory = any.string();
  const additionalConfigs = any.listOf(any.word);
  const results = any.simpleObject();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
    sandbox.stub(eslint, 'scaffold');
  });

  teardown(() => sandbox.restore());

  test('that initial config is created', async () => {
    eslint.scaffold
      .withArgs({scope, projectRoot, additionalConfigs, ignore: {directories: [`/${buildDirectory}/`]}})
      .resolves(results);

    assert.equal(
      await scaffoldEsLint({projectRoot, buildDirectory, config: {packageName, scope}, additionalConfigs}),
      results
    );
  });

  test('that the coverage directory is excluded when the project is unit tested', async () => {
    eslint.scaffold
      .withArgs({scope, projectRoot, additionalConfigs, ignore: {directories: [`/${buildDirectory}/`, '/coverage/']}})
      .resolves(results);

    assert.equal(
      await scaffoldEsLint({
        projectRoot,
        buildDirectory,
        config: {packageName, scope},
        additionalConfigs,
        unitTested: true
      }),
      results
    );
  });
});
