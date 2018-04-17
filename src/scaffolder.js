import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import {prompt} from 'inquirer';
import uniq from 'lodash.uniq';
import npmConfFactory from '../third-party-wrappers/npm-conf';
import exec from '../third-party-wrappers/exec-as-promised';
import buildPackage from './package';
import install from './install';
import {scopePromptShouldBePresented, shouldBeScopedPromptShouldBePresented} from './prompt-condiftionals';

export const questionNames = {
  NODE_VERSION_CATEGORY: 'nodeVersionCategory',
  PACKAGE_TYPE: 'packageType',
  SHOULD_BE_SCOPED: 'shouldBeScoped',
  SCOPE: 'scope',
  UNIT_TESTS: 'unitTests',
  INTEGRATION_TESTS: 'integrationTests',
  AUTHOR_NAME: 'authorName',
  AUTHOR_EMAIL: 'authorEmail',
  AUTHOR_URL: 'authorUrl'
};

const testingQuestions = [
  {
    name: questionNames.UNIT_TESTS,
    message: 'Will this project be unit tested?',
    type: 'confirm',
    default: true
  },
  {
    name: questionNames.INTEGRATION_TESTS,
    message: 'Will this project be integration tested?',
    type: 'confirm',
    default: true
  }
];

async function determineNodeVersionForProject(nodeVersionCategory) {
  console.log(chalk.grey(`Determining ${                          // eslint-disable-line no-console
    nodeVersionCategory.toLowerCase()
  } version of node`));
  const nvmLsOutput = await exec(`. ~/.nvm/nvm.sh && nvm ls-remote${('LTS' === nodeVersionCategory) ? ' --lts' : ''}`);
  const lsLines = nvmLsOutput.split('\n');
  const lsLine = lsLines[lsLines.length - 2];
  return lsLine.match(/(v[0-9]+\.[0-9]+\.[0-9]+)/)[1];
}

export async function scaffold({projectRoot, projectName, visibility, license, vcs, ci, description}) {
  console.log(chalk.blue('Initializing JavaScript project'));     // eslint-disable-line no-console

  const npmConf = npmConfFactory();
  const authorQuestions = [
    {
      name: questionNames.AUTHOR_NAME,
      message: 'What is the author\'s name?',
      default: npmConf.get('init.author.name')
    },
    {
      name: questionNames.AUTHOR_EMAIL,
      message: 'What is the author\'s email?',
      default: npmConf.get('init.author.email')
    },
    {
      name: questionNames.AUTHOR_URL,
      message: 'What is the author\'s website url?',
      default: npmConf.get('init.author.url')
    }
  ];

  const answers = await prompt([
    {
      name: questionNames.NODE_VERSION_CATEGORY,
      message: 'What node.js version should be used?',
      type: 'list',
      choices: ['LTS', 'Latest'],
      default: 'Latest'
    },
    {
      name: questionNames.PACKAGE_TYPE,
      message: 'What type of JavaScript project is this?',
      type: 'list',
      choices: ['Application', 'Package'],
      default: 'Package'
    },
    {
      name: questionNames.SHOULD_BE_SCOPED,
      message: 'Should this package be scoped?',
      type: 'confirm',
      when: shouldBeScopedPromptShouldBePresented,
      default: true
    },
    {
      name: questionNames.SCOPE,
      message: 'What is the scope?',
      when: scopePromptShouldBePresented,
      default: 'travi'
    },
    ...authorQuestions,
    ...testingQuestions
  ]);

  const devDependencies = uniq([
    '@travi/eslint-config-travi',
    'commitlint-config-travi',
    'npm-run-all',
    'husky@next',
    'cz-conventional-changelog',
    'greenkeeper-lockfile',
    ...answers[questionNames.UNIT_TESTS] ? ['mocha', 'chai', 'sinon'] : [],
    ...answers[questionNames.INTEGRATION_TESTS] ? ['cucumber', 'chai'] : []
  ]);

  const nodeVersion = await determineNodeVersionForProject(answers[questionNames.NODE_VERSION_CATEGORY]);

  console.log(chalk.grey('Writing project files'));      // eslint-disable-line no-console

  const packageType = answers[questionNames.PACKAGE_TYPE];

  const packageData = buildPackage({
    projectName,
    visibility,
    scope: answers[questionNames.SCOPE],
    packageType,
    license,
    vcs,
    tests: {
      unit: answers[questionNames.UNIT_TESTS],
      integration: answers[questionNames.INTEGRATION_TESTS]
    },
    author: {
      name: answers[questionNames.AUTHOR_NAME],
      email: answers[questionNames.AUTHOR_EMAIL],
      url: answers[questionNames.AUTHOR_URL]
    },
    ci,
    description
  });

  const npmIgnoreDirectories = ['/src/', '/test/'];
  const npmIgnoreFiles = [
    '.editorconfig',
    '.eslintcache',
    '.eslintignore',
    '.eslintrc.yml',
    '.markdownlintrc',
    '.nvmrc',
    ('Travis' === ci) && '.travis.yml',
    'rollup.config.js'
  ].filter(Boolean);

  await Promise.all([
    writeFile(`${projectRoot}/.nvmrc`, nodeVersion),
    writeFile(`${projectRoot}/package.json`, JSON.stringify(packageData)),
    ('Application' === packageType) && writeFile(`${projectRoot}/.npmrc`, 'save-exact=true'),
    copyFile(resolve(__dirname, '..', 'templates', 'huskyrc.json'), `${projectRoot}/.huskyrc.json`),
    copyFile(resolve(__dirname, '..', 'templates', 'commitlintrc.js'), `${projectRoot}/.commitlintrc.js`),
    ('Package' === packageType) && writeFile(
      `${projectRoot}/.npmignore`,
      `${npmIgnoreDirectories.join('\n')}\n\n${npmIgnoreFiles.join('\n')}`
    )
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
        }
      }
    },
    vcsIgnore: {
      files: ['.eslintcache'],
      directories: ['/node_modules/', '/lib/']
    },
    verificationCommand: 'npm test'
  };
}
