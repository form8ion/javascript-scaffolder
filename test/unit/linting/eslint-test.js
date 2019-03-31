import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as mkdir from '../../../third-party-wrappers/make-dir';
import scaffoldEsLint from '../../../src/linting/eslint';

suite('eslint config scaffolder', () => {
  let sandbox;
  const packageName = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(mkdir, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the dependency is installed if the config is defined', async () => {
    const result = await scaffoldEsLint({config: {packageName}});

    assert.deepEqual(result.devDependencies, [packageName]);
  });

  test('that the script is defined', async () => {
    assert.deepEqual((await scaffoldEsLint({config: {packageName}})).scripts, {'lint:js': 'eslint . --cache'});
  });

  test('that the cache file is ignored from version control', async () => {
    const result = await scaffoldEsLint({config: {packageName}});

    assert.deepEqual(result.vcsIgnore.files, ['.eslintcache']);
  });

  suite('config', () => {
    const projectRoot = any.string();
    const prefix = any.string();

    test('that the base config is added to the root of the project if the config prefix is provided', async () => {
      await scaffoldEsLint({
        projectRoot,
        config: {
          packageName,
          prefix
        }
      });

      assert.calledWith(fs.writeFile, `${projectRoot}/.eslintrc.yml`, `extends: '${prefix}/rules/es6'`);
      assert.neverCalledWith(fs.writeFile, `${projectRoot}/test/.eslintrc.yml`);
      assert.neverCalledWith(fs.writeFile, `${projectRoot}/test/unit/.eslintrc.yml`);
      assert.neverCalledWith(mkdir.default, `${projectRoot}/test/unit`);
    });

    test(
      'that the test config is added if the config prefix is provided and the project will be unit tested',
      async () => {
        const pathToCreatedDirectory = any.string();
        mkdir.default.withArgs(`${projectRoot}/test/unit`).resolves(pathToCreatedDirectory);

        await scaffoldEsLint({
          projectRoot,
          config: {
            packageName,
            prefix
          },
          unitTested: true
        });

        assert.calledWith(
          fs.writeFile,
          `${pathToCreatedDirectory}/../.eslintrc.yml`,
          `extends: '${prefix}/rules/tests/base'`
        );
        assert.calledWith(
          fs.writeFile,
          `${pathToCreatedDirectory}/.eslintrc.yml`,
          `extends: '${prefix}/rules/tests/mocha'`
        );
      }
    );

    suite('eslint-ignore', () => {
      test('that non-source files are excluded from linting', async () => {
        await scaffoldEsLint({
          projectRoot,
          config: {
            packageName,
            prefix
          }
        });

        assert.calledWith(fs.writeFile, `${projectRoot}/.eslintignore`, sinon.match('/lib/'));
        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.eslintignore`, sinon.match('/coverage/'));
      });

      test('that the coverage folder is excluded from linting when the project is unit tested', async () => {
        await scaffoldEsLint({
          projectRoot,
          config: {
            packageName,
            prefix
          },
          unitTested: true
        });

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.eslintignore`,
          sinon.match(`
/coverage/`)
        );
      });
    });
  });
});
