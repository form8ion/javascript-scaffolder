// ##### Dependencies:
import yargs from 'yargs';
import {scaffold} from '@travi/project-scaffolder';
import {scaffold as scaffoldJavaScript} from './lib/index.cjs';

// ##### Register with yargs
yargs
  .scriptName('form8ion-utils')
  .usage('Usage: $0 <cmd> [args]')
  .command('scaffold', 'Scaffold a new project', () => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript({
        ...options,
        configs: {
          eslint: {scope: '@form8ion'},
          remark: '@form8ion/remark-lint-preset',
          babelPreset: {name: '@form8ion', packageName: '@form8ion/babel-preset'},
          commitlint: {name: '@form8ion', packageName: '@form8ion/commitlint-config'}
        },
        overrides: {npmAccount: 'form8ion'},
        ciServices: {}
      })
    },
    overrides: {copyrightHolder: 'Matt Travi'}
  }))
  .help('h')
  .alias('h', 'help')
  .argv;
