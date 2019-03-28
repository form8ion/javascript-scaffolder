import {copyFile} from 'mz/fs';
import determinePathToTemplateFile from '../template-path';

export default async function ({projectRoot}) {
  await copyFile(determinePathToTemplateFile('cucumber.txt'), `${projectRoot}/cucumber.js`);

  return {
    devDependencies: ['cucumber', 'chai'],
    scripts: {
      'test:integration': 'run-s \'test:integration:base -- --profile noWip\'',
      'test:integration:base': 'DEBUG=any cucumber-js test/integration --profile base',
      'test:integration:debug': 'DEBUG=test run-s test:integration',
      'test:integration:wip': 'run-s \'test:integration:base -- --profile wip\''
    }
  };
}
