// ##### Dependencies:
// remark-usage-ignore-next 3
import {resolve} from 'path';
import stubbedFs from 'mock-fs';
import td from 'testdouble';

// remark-usage-ignore-next 9
stubbedFs({
  node_modules: stubbedFs.load(resolve(...[__dirname, 'node_modules'])),
  lib: stubbedFs.load(resolve(...[__dirname, 'lib'])),
  templates: stubbedFs.load(resolve(...[__dirname, 'templates']))
});
const execa = td.replace('execa');
td.when(execa('. ~/.nvm/nvm.sh && nvm ls-remote --lts', {shell: true}))
  .thenResolve({stdout: ['v16.5.4', ''].join('\n')});
td.when(execa('. ~/.nvm/nvm.sh && nvm install', {shell: true})).thenReturn({stdout: {pipe: () => undefined}});

const {dialects, projectTypes} = require('@form8ion/javascript-core');
const {scaffold: scaffoldJavaScript, questionNames} = require('./lib/index.cjs');

// ##### Execute
(async () => {
  const accountName = 'form8ion';

  await scaffoldJavaScript({
    projectRoot: process.cwd(),
    projectName: 'project-name',
    visibility: 'Public',
    license: 'MIT',
    configs: {
      eslint: {scope: `@${accountName}`},
      remark: `@${accountName}/remark-lint-preset`,
      babelPreset: {name: `@${accountName}`, packageName: `@${accountName}/babel-preset`},
      commitlint: {name: `@${accountName}`, packageName: `@${accountName}/commitlint-config`}
    },
    overrides: {npmAccount: accountName},
    ciServices: {},
    unitTestFrameworks: {},
    decisions: {
      [questionNames.DIALECT]: dialects.BABEL,
      [questionNames.NODE_VERSION_CATEGORY]: 'LTS',
      [questionNames.PACKAGE_MANAGER]: 'npm',
      [questionNames.PROJECT_TYPE]: projectTypes.PACKAGE,
      [questionNames.SHOULD_BE_SCOPED]: true,
      [questionNames.SCOPE]: accountName,
      [questionNames.AUTHOR_NAME]: 'Your Name',
      [questionNames.AUTHOR_EMAIL]: 'you@domain.tld',
      [questionNames.AUTHOR_URL]: 'https://your.website.tld',
      [questionNames.UNIT_TESTS]: true,
      [questionNames.INTEGRATION_TESTS]: true
    }
  });
})();
