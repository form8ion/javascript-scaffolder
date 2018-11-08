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
import scaffoldEsLint from './config/eslint';
import scaffoldDocumentation from './documentation';
import {determineLatestVersionOf, install as installNodeVersion} from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';

export async function scaffold(options) {
  console.log(chalk.blue('Initializing JavaScript project'));     // eslint-disable-line no-console

  const {
    projectRoot,
    projectName,
    visibility,
    license,
    vcs,
    description,
    configs,
    overrides,
    ciServices
  } = validate(options);
  const answers = await prompt(overrides, Object.keys(ciServices), visibility);
  const unitTested = answers[questionNames.UNIT_TESTS];
  const integrationTested = answers[questionNames.INTEGRATION_TESTS];
  const packageType = answers[questionNames.PACKAGE_TYPE];
  const ci = answers[questionNames.CI_SERVICE];
  const scope = answers[questionNames.SCOPE];
  const nodeVersionCategory = answers[questionNames.NODE_VERSION_CATEGORY];

  const eslint = await scaffoldEsLint(({config: configs.eslint, projectRoot, unitTested}));

  const devDependencies = uniq([
    ...eslint.devDependencies,
    'npm-run-all',
    'husky',
    'cz-conventional-changelog',
    'babel-register',
    'ban-sensitive-files',
    configs.commitlint && configs.commitlint.packageName,
    configs.babelPreset && configs.babelPreset.packageName,
    ...configs.remark ? [configs.remark, 'remark-cli'] : [],
    ...'Private' === visibility ? ['greenkeeper-lockfile'] : [],
    ...'Package' === packageType ? ['rimraf', 'rollup', 'rollup-plugin-auto-external'] : [],
    ...'Public' === visibility && unitTested ? ['codecov'] : [],
    ...unitTested ? ['mocha', 'chai', 'sinon', 'nyc', '@travi/any'] : [],
    ...integrationTested ? ['cucumber', 'chai'] : [],
    ...'Travis' === ci ? ['travis-lint'] : []
  ].filter(Boolean));

  const nodeVersion = await determineLatestVersionOf(nodeVersionCategory);

  console.log(chalk.grey('Writing project files'));      // eslint-disable-line no-console

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
      name: answers[questionNames.AUTHOR_NAME],
      email: answers[questionNames.AUTHOR_EMAIL],
      url: answers[questionNames.AUTHOR_URL]
    },
    ci,
    description,
    configs
  });

  const [ciService] = await Promise.all([
    scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType, nodeVersion}),
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
      copyFile(resolve(__dirname, '..', 'templates', 'mocha.opts'), `${path}/../mocha.opts`)
    ])),
    configs.remark && writeFile(`${projectRoot}/.remarkrc.js`, `exports.plugins = ['${configs.remark}'];`)
  ]);

  await installNodeVersion(nodeVersionCategory);

  console.log(chalk.grey('Installing devDependencies'));          // eslint-disable-line no-console
  await install(devDependencies);

  return {
    badges: buildBadgesDetails(visibility, packageType, packageData, ciService, unitTested, vcs),
    documentation: scaffoldDocumentation({packageType, packageName: packageData.name, visibility, scope}),
    vcsIgnore: {
      files: [...eslint.vcsIgnore.files],
      directories: ['/node_modules/', '/lib/', '/coverage/', '/.nyc_output/']
    },
    verificationCommand: 'npm test',
    projectDetails: {...packageData.homepage && {homepage: packageData.homepage}}
  };
}
