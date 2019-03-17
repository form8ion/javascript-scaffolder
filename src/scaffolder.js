import {resolve} from 'path';
import {copyFile, writeFile} from 'mz/fs';
import chalk from 'chalk';
import buildPackage from './package';
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
import installDependencies from './package/dependencies';

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
  const [babel, testing, linting, commitizen, husky, host, ciService, commitConvention] = await Promise.all([
    scaffoldBabel({preset: configs.babelPreset, projectRoot}),
    scaffoldTesting({projectRoot, tests, visibility}),
    scaffoldLinting(({configs, projectRoot, tests})),
    scaffoldCommitizen({projectRoot}),
    scaffoldHusky({projectRoot}),
    scaffoldHost(hosts, chosenHost),
    scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType: projectType, nodeVersion, tests}),
    scaffoldCommitConvention({projectRoot, configs})
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
    ('Package' === projectType) && copyFile(
      resolve(__dirname, '..', 'templates', 'rollup.config.js'),
      `${projectRoot}/rollup.config.js`
    )
  ]);

  await installNodeVersion(nodeVersionCategory);

  await installDependencies({
    projectType,
    contributors: [host, testing, linting, babel, commitizen, commitConvention, husky, ciService]
  });

  return {
    badges: buildBadgesDetails(visibility, projectType, packageData.name, ciService, unitTested, vcs),
    documentation: scaffoldDocumentation({projectType, packageName: packageData.name, visibility, scope}),
    vcsIgnore: buildVcsIgnoreLists({host, linting, testing, projectType}),
    verificationCommand: 'npm test',
    projectDetails: {...packageData.homepage && {homepage: packageData.homepage}}
  };
}
