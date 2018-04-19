import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import uniq from 'lodash.uniq';
import exec from '../third-party-wrappers/exec-as-promised';
import buildPackage from './package';
import install from './install';
import {questionNames, prompt} from './prompts';

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

  const answers = await prompt();

  const devDependencies = uniq([
    '@travi/eslint-config-travi',
    'commitlint-config-travi',
    'npm-run-all',
    'husky@next',
    'cz-conventional-changelog',
    'greenkeeper-lockfile',
    'nyc',
    ...'Public' === visibility ? ['codecov'] : [],
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

  const npmIgnoreDirectories = ['/src/', '/test/', '/coverage/', '/.nyc_output/'];
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
    copyFile(resolve(__dirname, '..', 'templates', 'nycrc.json'), `${projectRoot}/.nycrc`),
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
      directories: ['/node_modules/', '/lib/', '/coverage/', '/.nyc_output/']
    },
    verificationCommand: 'npm test'
  };
}
