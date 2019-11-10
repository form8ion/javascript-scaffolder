import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as templatePath from '../template-path';
import scaffoldCucumber from './cucumber';

suite('cucumber scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'copyFile');
    sandbox.stub(fs, 'writeFile');
    sandbox.stub(templatePath, 'default');
  });

  teardown(() => sandbox.restore());

  test('that cucumber is scaffolded', async () => {
    const pathToTemplate = any.string();
    fs.copyFile.resolves();
    fs.writeFile.resolves();
    templatePath.default.withArgs('cucumber.txt').returns(pathToTemplate);

    assert.deepEqual(
      await scaffoldCucumber({projectRoot}),
      {
        devDependencies: ['cucumber', 'chai', 'gherkin-lint'],
        scripts: {
          'lint:gherkin': 'gherkin-lint',
          'test:integration': 'run-s \'test:integration:base -- --profile noWip\'',
          'test:integration:base': 'DEBUG=any cucumber-js test/integration --profile base',
          'test:integration:debug': 'DEBUG=test run-s test:integration',
          'test:integration:wip': 'run-s \'test:integration:base -- --profile wip\'',
          'test:integration:focus': 'run-s \'test:integration:base -- --profile focus\''
        },
        eslintConfigs: ['cucumber']
      }
    );
    assert.calledWith(fs.copyFile, pathToTemplate, `${projectRoot}/cucumber.js`);
    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/.gherkin-lintrc`,
      JSON.stringify({
        'no-restricted-tags': ['on', {tags: ['@focus']}],
        'use-and': 'on',
        'no-multiple-empty-lines': 'on',
        'no-dupe-feature-names': 'on'
      })
    );
  });
});
