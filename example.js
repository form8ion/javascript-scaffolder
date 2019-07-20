// ##### Dependencies:
import program from 'commander';
import {scaffold} from '@travi/project-scaffolder';
import {scaffold as scaffoldJavaScript} from './lib/index.cjs';

// ##### Register with commander
program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript({
        ...options,
        configs: {
          eslint: {prefix: '@travi/travi', packageName: '@travi/eslint-config-travi'},
          commitlint: {name: 'travi', packageName: 'commitlint-config-travi'},
          babelPreset: {name: '@travi', packageName: '@travi/babel-preset'}
        }
      })
    },
    overrides: {copyrightHolder: 'Matt Travi'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
