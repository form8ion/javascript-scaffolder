import {copyFile, writeFile} from 'mz/fs';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
  await Promise.all([
    copyFile(determinePathToTemplateFile('cucumber.txt'), `${projectRoot}/cucumber.js`),
    writeFile(
      `${projectRoot}/.gherkin-lintrc`,
      JSON.stringify({
        'no-restricted-tags': ['on', {tags: ['@focus']}],
        'use-and': 'on',
        'no-multiple-empty-lines': 'on',
        'no-dupe-feature-names': 'on'
      })
    )
  ]);

  return {
    devDependencies: ['cucumber', 'chai', 'gherkin-lint'],
    scripts: {
      'lint:gherkin': 'gherkin-lint',
      'test:integration': 'run-s \'test:integration:base -- --profile noWip\'',
      'test:integration:base': 'DEBUG=any cucumber-js test/integration --profile base',
      'test:integration:debug': 'DEBUG=test run-s test:integration',
      'test:integration:wip': 'run-s \'test:integration:base -- --profile wip\''
    },
    eslintConfigs: ['cucumber']
  };
}
