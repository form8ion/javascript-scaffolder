import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import uniq from 'lodash.uniq';
import exec from '../third-party-wrappers/exec-as-promised';
import mkdir from '../third-party-wrappers/make-dir';
import buildPackage from './package';
import install from './install';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldCi from './ci';
import scaffoldDocumentation from './documentation';
import {questionNames} from './prompts/question-names';

async function determineNodeVersionForProject(nodeVersionCategory) {
  const lowerCaseCategory = nodeVersionCategory.toLowerCase();
  console.log(chalk.grey(`Determining ${lowerCaseCategory} version of node`));    // eslint-disable-line no-console
  const nvmLsOutput = await exec(`. ~/.nvm/nvm.sh && nvm ls-remote${('LTS' === nodeVersionCategory) ? ' --lts' : ''}`);
  const lsLines = nvmLsOutput.split('\n');
  const lsLine = lsLines[lsLines.length - 2];
  return lsLine.match(/(v[0-9]+\.[0-9]+\.[0-9]+)/)[1];
}

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
  const answers = await prompt(overrides, Object.keys(ciServices));
  const unitTested = answers[questionNames.UNIT_TESTS];
  const integrationTested = answers[questionNames.INTEGRATION_TESTS];
  const packageType = answers[questionNames.PACKAGE_TYPE];
  const ci = answers[questionNames.CI_SERVICE];
  const scope = answers[questionNames.SCOPE];

  const devDependencies = uniq([
    configs.eslint && configs.eslint.packageName,
    configs.commitlint && configs.commitlint.packageName,
    configs.babelPreset && configs.babelPreset.packageName,
    'npm-run-all',
    'husky@next',
    'cz-conventional-changelog',
    'greenkeeper-lockfile',
    'babel-register',
    'ban-sensitive-files',
    ...'Package' === packageType ? ['rimraf', 'rollup', 'rollup-plugin-auto-external'] : [],
    ...'Public' === visibility && unitTested ? ['codecov'] : [],
    ...unitTested ? ['mocha', 'chai', 'sinon', 'nyc'] : [],
    ...integrationTested ? ['cucumber', 'chai'] : [],
    ...'Travis' === ci ? ['travis-lint'] : []
  ].filter(Boolean));

  const nodeVersion = await determineNodeVersionForProject(answers[questionNames.NODE_VERSION_CATEGORY]);

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
    description
  });

  const eslintIgnoreDirectories = ['/lib/', ...unitTested ? ['/coverage/'] : []];
  const npmIgnoreDirectories = [
    '/src/',
    '/test/',
    '/coverage/',
    '/.nyc_output/',
    'GitHub' === vcs.host ? '/.github/' : undefined
  ].filter(Boolean);
  const npmIgnoreFiles = [
    '.babelrc',
    '.commitlintrc.js',
    '.editorconfig',
    '.eslintcache',
    '.eslintignore',
    '.eslintrc.yml',
    '.gitattributes',
    '.huskyrc.json',
    '.markdownlintrc',
    '.nvmrc',
    ('Travis' === ci) && '.travis.yml',
    'coverage.lcov',
    'rollup.config.js'
  ].filter(Boolean);

  const [ciService] = await Promise.all([
    scaffoldCi(ciServices, answers[questionNames.CI_SERVICE], {projectRoot, vcs, visibility, packageType}),
    writeFile(`${projectRoot}/.nvmrc`, nodeVersion),
    writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData)),
    configs.babelPreset && writeFile(`${projectRoot}/.babelrc`, JSON.stringify({presets: [configs.babelPreset.name]})),
    configs.eslint && Promise.all([
      writeFile(`${projectRoot}/.eslintrc.yml`, `extends: '${configs.eslint.prefix}/rules/es6'`),
      writeFile(`${projectRoot}/.eslintignore`, eslintIgnoreDirectories.join('\n'))
    ]),
    ('Application' === packageType) && writeFile(`${projectRoot}/.npmrc`, 'save-exact=true\n'),
    copyFile(resolve(__dirname, '..', 'templates', 'huskyrc.json'), `${projectRoot}/.huskyrc.json`),
    configs.commitlint && writeFile(
      `${projectRoot}/.commitlintrc.js`,
      `module.exports = {extends: ['${configs.commitlint.name}']};`
    ),
    ('Package' === packageType) && Promise.all([
      writeFile(`${projectRoot}/.npmignore`, `${npmIgnoreDirectories.join('\n')}\n\n${npmIgnoreFiles.join('\n')}`),
      copyFile(resolve(__dirname, '..', 'templates', 'rollup.config.js'), `${projectRoot}/rollup.config.js`)
    ]),
    unitTested && mkdir(`${projectRoot}/test/unit`).then(path => Promise.all([
      copyFile(resolve(__dirname, '..', 'templates', 'nycrc.json'), `${projectRoot}/.nycrc`),
      copyFile(resolve(__dirname, '..', 'templates', 'canary-test.txt'), `${path}/canary-test.js`),
      copyFile(resolve(__dirname, '..', 'templates', 'mocha.opts'), `${path}/../mocha.opts`),
      configs.eslint && Promise.all([
        writeFile(`${projectRoot}/test/.eslintrc.yml`, `extends: '${configs.eslint.prefix}/rules/tests/base'`),
        writeFile(`${projectRoot}/test/unit/.eslintrc.yml`, `extends: '${configs.eslint.prefix}/rules/tests/mocha'`)
      ])
    ]))
  ]);

  const versionCategory = answers[questionNames.NODE_VERSION_CATEGORY].toLowerCase();
  console.log(chalk.grey(`Installing ${versionCategory} version of node using nvm`));  // eslint-disable-line no-console
  await exec('. ~/.nvm/nvm.sh && nvm install', {silent: false});

  console.log(chalk.grey('Installing devDependencies'));          // eslint-disable-line no-console
  await install(devDependencies);

  return {
    badges: {
      consumer: {
        ...('Public' === visibility && 'Package' === packageType) && {
          npm: {
            img: `https://img.shields.io/npm/v/${packageData.name}.svg`,
            text: 'npm',
            link: `https://www.npmjs.com/package/${packageData.name}`
          }
        }
      },
      contribution: {
        'commit-convention': {
          img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
          text: 'Conventional Commits',
          link: 'https://conventionalcommits.org'
        },
        commitizen: {
          img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
          text: 'Commitizen friendly',
          link: 'http://commitizen.github.io/cz-cli/'
        },
        ...'Package' === packageType && {
          'semantic-release': {
            img: 'https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg',
            text: 'semantic-release',
            link: 'https://github.com/semantic-release/semantic-release'
          }
        }
      },
      status: {
        ...ciService.badge && {ci: ciService.badge},
        ...unitTested && 'Public' === visibility && {
          coverage: {
            img: `https://img.shields.io/codecov/c/github/${vcs.owner}/${vcs.name}.svg`,
            link: `https://codecov.io/github/${vcs.owner}/${vcs.name}`,
            text: 'Codecov'
          }
        }
      }
    },
    documentation: scaffoldDocumentation({packageType, packageName: packageData.name, visibility, scope}),
    vcsIgnore: {
      files: ['.eslintcache'],
      directories: ['/node_modules/', '/lib/', '/coverage/', '/.nyc_output/']
    },
    verificationCommand: 'npm test',
    projectDetails: {...packageData.homepage && {homepage: packageData.homepage}}
  };
}
