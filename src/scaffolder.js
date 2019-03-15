import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import uniq from 'lodash.uniq';
import buildPackage from './package';
import install from './package/install';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldTesting from './testing';
import scaffoldCi from './ci';
import scaffoldHost from './host';
import scaffoldBabel from './config/babel';
import scaffoldEsLint from './lint/eslint';
import scaffoldHusky from './config/husky';
import scaffoldNpmConfig from './config/npm';
import scaffoldCommitizen from './config/commitizen';
import scaffoldDocumentation from './documentation';
import {determineLatestVersionOf, install as installNodeVersion} from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';
import buildVcsIgnoreLists from './vcs-ignore';

export async function scaffold(options) {
  console.error(chalk.blue('Initializing JavaScript project'));     // eslint-disable-line no-console

  const {
    projectRoot,
    projectName,
    visibility,
    license,
    vcs,
    description,
    configs,
    overrides,
    ciServices,
    hosts
  } = validate(options);

  const {
    [questionNames.UNIT_TESTS]: unitTested,
    [questionNames.INTEGRATION_TESTS]: integrationTested,
    [questionNames.PROJECT_TYPE]: projectType,
    [questionNames.CI_SERVICE]: ci,
    [questionNames.HOST]: chosenHost,
    [questionNames.SCOPE]: scope,
    [questionNames.NODE_VERSION_CATEGORY]: nodeVersionCategory,
    [questionNames.AUTHOR_NAME]: authorName,
    [questionNames.AUTHOR_EMAIL]: authorEmail,
    [questionNames.AUTHOR_URL]: authorUrl
  } = await prompt(overrides, ciServices, hosts, visibility);

  const nodeVersion = await determineLatestVersionOf(nodeVersionCategory);

  console.error(chalk.grey('Writing project files'));      // eslint-disable-line no-console

  const tests = {unit: unitTested, integration: integrationTested};
  const [babel, testing, eslint, commitizen, husky, host, ciService] = await Promise.all([
    scaffoldBabel({preset: configs.babelPreset, projectRoot}),
    scaffoldTesting({projectRoot, tests, visibility}),
    scaffoldEsLint(({config: configs.eslint, projectRoot, unitTested})),
    scaffoldCommitizen({projectRoot}),
    scaffoldHusky({projectRoot}),
    scaffoldHost(hosts, chosenHost),
    scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType: projectType, nodeVersion, tests})
  ]);

  const packageData = buildPackage({
    projectName,
    visibility,
    scope,
    projectType,
    license,
    vcs,
    tests,
    author: {
      name: authorName,
      email: authorEmail,
      url: authorUrl
    },
    ci,
    description,
    configs,
    scripts: {...testing.scripts, ...ciService.scripts}
  });

  await Promise.all([
    writeFile(`${projectRoot}/.nvmrc`, nodeVersion),
    writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData)),
    scaffoldNpmConfig({projectType, projectRoot}),
    configs.commitlint && writeFile(
      `${projectRoot}/.commitlintrc.js`,
      `module.exports = {extends: ['${configs.commitlint.name}']};`
    ),
    ('Package' === projectType) && copyFile(
      resolve(__dirname, '..', 'templates', 'rollup.config.js'),
      `${projectRoot}/rollup.config.js`
    ),
    configs.remark && writeFile(`${projectRoot}/.remarkrc.js`, `exports.plugins = ['${configs.remark}'];`)
  ]);

  await installNodeVersion(nodeVersionCategory);

  console.error(chalk.grey('Installing devDependencies'));          // eslint-disable-line no-console
  await install(uniq([
    ...host.devDependencies,
    ...testing.devDependencies,
    ...eslint.devDependencies,
    ...babel.devDependencies,
    ...commitizen.devDependencies,
    ...husky.devDependencies,
    ...ciService.devDependencies,
    'npm-run-all',
    'ban-sensitive-files',
    configs.commitlint && configs.commitlint.packageName,
    ...configs.remark ? [configs.remark, 'remark-cli'] : [],
    ...'Package' === projectType ? ['rimraf', 'rollup', 'rollup-plugin-auto-external'] : []
  ].filter(Boolean)));

  return {
    badges: buildBadgesDetails(visibility, projectType, packageData.name, ciService, unitTested, vcs),
    documentation: scaffoldDocumentation({projectType, packageName: packageData.name, visibility, scope}),
    vcsIgnore: buildVcsIgnoreLists({host, eslint, projectType}),
    verificationCommand: 'npm test',
    projectDetails: {...packageData.homepage && {homepage: packageData.homepage}}
  };
}
