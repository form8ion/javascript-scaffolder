import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldTesting from './testing';
import scaffoldCi from './ci';
import scaffoldHost from './host';
import scaffoldBabel from './config/babel';
import scaffoldLinting from './linting';
import scaffoldHusky from './config/husky';
import scaffoldNpmConfig from './config/npm';
import scaffoldCommitizen from './config/commitizen';
import scaffoldCommitConvention from './commit-convention';
import scaffoldDocumentation from './documentation';
import {determineLatestVersionOf, install as installNodeVersion} from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';
import buildVcsIgnoreLists from './vcs-ignore';
import scaffoldPackage from './package';

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
  } = await prompt(overrides, ciServices, hosts, visibility, vcs);

  const nodeVersion = await determineLatestVersionOf(nodeVersionCategory);

  console.error(chalk.grey('Writing project files'));      // eslint-disable-line no-console

  const tests = {unit: unitTested, integration: integrationTested};
  const contributors = await Promise.all([
    scaffoldHost(hosts, chosenHost),
    scaffoldTesting({projectRoot, tests, visibility}),
    scaffoldLinting(({configs, projectRoot, tests})),
    scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType: projectType, nodeVersion, tests}),
    scaffoldBabel({preset: configs.babelPreset, projectRoot}),
    scaffoldCommitizen({projectRoot}),
    scaffoldCommitConvention({projectRoot, configs}),
    scaffoldHusky({projectRoot})
  ]);
  const [host, testing, linting, ciService] = contributors;

  await Promise.all([
    writeFile(`${projectRoot}/.nvmrc`, nodeVersion),
    scaffoldNpmConfig({projectType, projectRoot}),
    ('Package' === projectType) && copyFile(
      resolve(__dirname, '..', 'templates', 'rollup.config.js'),
      `${projectRoot}/rollup.config.js`
    )
  ]);

  await installNodeVersion(nodeVersionCategory);

  const {name: packageName, homepage: projectHomepage} = await scaffoldPackage({
    projectRoot,
    projectType,
    contributors,
    projectName,
    visibility,
    scope,
    license,
    vcs,
    tests,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    ci,
    description,
    configs
  });

  return {
    badges: buildBadgesDetails(visibility, projectType, packageName, ciService, unitTested, vcs),
    documentation: scaffoldDocumentation({projectType, packageName, visibility, scope}),
    vcsIgnore: buildVcsIgnoreLists({host, linting, testing, projectType}),
    verificationCommand: 'npm test',
    projectDetails: {...projectHomepage && {homepage: projectHomepage}}
  };
}
