import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import uniq from 'lodash.uniq';
import mkdir from '../third-party-wrappers/make-dir';
import buildPackage from './package';
import install from './install';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldCi from './ci';
import scaffoldHost from './host';
import scaffoldEsLint from './config/eslint';
import scaffoldCommitizen from './commitizen';
import scaffoldDocumentation from './documentation';
import {determineLatestVersionOf, install as installNodeVersion} from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';

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
    [questionNames.PACKAGE_TYPE]: packageType,
    [questionNames.CI_SERVICE]: ci,
    [questionNames.HOST]: chosenHost,
    [questionNames.SCOPE]: scope,
    [questionNames.NODE_VERSION_CATEGORY]: nodeVersionCategory,
    [questionNames.AUTHOR_NAME]: authorName,
    [questionNames.AUTHOR_EMAIL]: authorEmail,
    [questionNames.AUTHOR_URL]: authorUrl
  } = await prompt(overrides, Object.keys(ciServices), hosts, visibility);

  const [eslint, commitizen, host] = await Promise.all([
    scaffoldEsLint(({config: configs.eslint, projectRoot, unitTested})),
    scaffoldCommitizen({projectRoot}),
    scaffoldHost(hosts, chosenHost)
  ]);

  const devDependencies = uniq([
    ...eslint.devDependencies,
    ...commitizen.devDependencies,
    'npm-run-all',
    'husky',
    '@babel/register',
    'ban-sensitive-files',
    configs.commitlint && configs.commitlint.packageName,
    configs.babelPreset && configs.babelPreset.packageName,
    ...configs.remark ? [configs.remark, 'remark-cli'] : [],
    ...'Private' === visibility ? ['greenkeeper-lockfile'] : [],
    ...'Package' === packageType ? ['rimraf', 'rollup', 'rollup-plugin-auto-external'] : [],
    ...'Public' === visibility && unitTested ? ['codecov'] : [],
    ...unitTested ? ['mocha', 'chai', 'sinon', 'nyc', '@travi/any'] : [],
    ...integrationTested ? ['cucumber', 'chai'] : [],
    ...'Travis' === ci ? ['travis-lint'] : [],
    ...host.devDependencies ? host.devDependencies : []
  ].filter(Boolean));

  const nodeVersion = await determineLatestVersionOf(nodeVersionCategory);

  console.error(chalk.grey('Writing project files'));      // eslint-disable-line no-console

  const packageData = buildPackage({
    projectName,
    visibility,
    scope,
    packageType,
    license,
    vcs,
    tests: {
      unit: unitTested,
      integration: integrationTested
    },
    author: {
      name: authorName,
      email: authorEmail,
      url: authorUrl
    },
    ci,
    description,
    configs
  });

  const [ciService] = await Promise.all([
    scaffoldCi(ciServices, ci, {
      projectRoot,
      vcs,
      visibility,
      packageType,
      nodeVersion,
      tests: {unit: unitTested}
    }),
    writeFile(`${projectRoot}/.nvmrc`, nodeVersion),
    writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData)),
    configs.babelPreset && writeFile(`${projectRoot}/.babelrc`, JSON.stringify({presets: [configs.babelPreset.name]})),
    ('Application' === packageType) && writeFile(`${projectRoot}/.npmrc`, 'save-exact=true\n'),
    copyFile(resolve(__dirname, '..', 'templates', 'huskyrc.json'), `${projectRoot}/.huskyrc.json`),
    configs.commitlint && writeFile(
      `${projectRoot}/.commitlintrc.js`,
      `module.exports = {extends: ['${configs.commitlint.name}']};`
    ),
    ('Package' === packageType) && copyFile(
      resolve(__dirname, '..', 'templates', 'rollup.config.js'),
      `${projectRoot}/rollup.config.js`
    ),
    unitTested && mkdir(`${projectRoot}/test/unit`).then(path => Promise.all([
      copyFile(resolve(__dirname, '..', 'templates', 'nycrc.json'), `${projectRoot}/.nycrc`),
      copyFile(resolve(__dirname, '..', 'templates', 'canary-test.txt'), `${path}/canary-test.js`),
      copyFile(resolve(__dirname, '..', 'templates', 'mocha.opts'), `${path}/../mocha.opts`),
      copyFile(resolve(__dirname, '..', 'templates', 'mocha-setup.txt'), `${path}/../mocha-setup.js`)
    ])),
    configs.remark && writeFile(`${projectRoot}/.remarkrc.js`, `exports.plugins = ['${configs.remark}'];`)
  ]);

  await installNodeVersion(nodeVersionCategory);

  console.error(chalk.grey('Installing devDependencies'));          // eslint-disable-line no-console
  await install(devDependencies);

  const defaultDirectoriesToIgnore = ['/node_modules/', '/lib/', '/coverage/', '/.nyc_output/'];
  const hostDirectoriesToIgnore = host.vcsIgnore ? host.vcsIgnore.directories : [];

  return {
    badges: buildBadgesDetails(visibility, packageType, packageData, ciService, unitTested, vcs),
    documentation: scaffoldDocumentation({packageType, packageName: packageData.name, visibility, scope}),
    vcsIgnore: {
      files: [...eslint.vcsIgnore.files],
      directories: [...defaultDirectoriesToIgnore, ...hostDirectoriesToIgnore]
    },
    verificationCommand: 'npm test',
    projectDetails: {...packageData.homepage && {homepage: packageData.homepage}}
  };
}
