import {promises as fsPromises} from 'fs';
import * as eslint from '@form8ion/eslint';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import scaffoldEsLint from './eslint';

suite('eslint config scaffolder', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fsPromises, 'writeFile');
    sandbox.stub(eslint, 'scaffold');
  });

  teardown(() => sandbox.restore());

  test('that initial config is created', async () => {
    const packageName = any.word();
    const scope = any.string();
    const projectRoot = any.string();
    const buildDirectory = any.string();
    const additionalIgnoredDirectories = any.listOf(any.word);
    const results = any.simpleObject();
    eslint.scaffold
      .withArgs({
        scope,
        projectRoot,
        ignore: {directories: [...additionalIgnoredDirectories, `/${buildDirectory}/`]}
      })
      .resolves(results);

    assert.equal(
      await scaffoldEsLint({
        projectRoot,
        buildDirectory,
        config: {packageName, scope},
        additionalConfiguration: {ignore: {directories: additionalIgnoredDirectories}}
      }),
      results
    );
  });
});
