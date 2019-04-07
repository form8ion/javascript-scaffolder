import chalk from 'chalk';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldTesting from './testing';
import scaffoldCi from './ci';
import scaffoldHost from './host';
import scaffoldBabel from './config/babel';
import scaffoldLinting from './linting';
import scaffoldNpmConfig from './config/npm';
import scaffoldCommitConvention from './commit-convention';
import scaffoldDocumentation from './documentation';
import scaffoldeNodeVersion from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';
import buildVcsIgnoreLists from './vcs-ignore';
import scaffoldPackage from './package';
import scaffoldPackageType from './project-type/package';
import scaffoldApplicationType from './project-type/application';

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
    hosts,
    applicationTypes
  } = validate(options);

  const {
    [commonQuestionNames.UNIT_TESTS]: unitTested,
    [commonQuestionNames.INTEGRATION_TESTS]: integrationTested,
    [questionNames.PROJECT_TYPE]: projectType,
    [commonQuestionNames.CI_SERVICE]: ci,
    [questionNames.HOST]: chosenHost,
    [questionNames.SCOPE]: scope,
    [questionNames.NODE_VERSION_CATEGORY]: nodeVersionCategory,
    [questionNames.AUTHOR_NAME]: authorName,
    [questionNames.AUTHOR_EMAIL]: authorEmail,
    [questionNames.AUTHOR_URL]: authorUrl,
    [questionNames.TRANSPILE_LINT]: transpileLint
  } = await prompt(overrides, ciServices, hosts, visibility, vcs);

  console.error(chalk.grey('Writing project files'));      // eslint-disable-line no-console

  const [applicationOrPackage] = await Promise.all([
    ...'Package' === projectType ? [scaffoldPackageType(({projectRoot}))] : [],
    ...'Application' === projectType ? [scaffoldApplicationType(({projectRoot, applicationTypes, configs}))] : []
  ]);
  const [nodeVersion] = await Promise.all([
    scaffoldeNodeVersion({projectRoot, nodeVersionCategory}),
    scaffoldNpmConfig({projectType, projectRoot})
  ]);
  const tests = {unit: unitTested, integration: integrationTested};
  const contributors = [
    ...(await Promise.all([
      scaffoldHost(
        hosts,
        chosenHost,
        {...applicationOrPackage && {buildDirectory: applicationOrPackage.buildDirectory}}
      ),
      scaffoldTesting({projectRoot, tests, visibility}),
      scaffoldLinting(({configs, projectRoot, tests, vcs, transpileLint})),
      scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType: projectType, nodeVersion, tests}),
      scaffoldBabel({preset: configs.babelPreset, projectRoot, transpileLint}),
      scaffoldCommitConvention({projectRoot, configs})
    ])),
    ...applicationOrPackage ? [applicationOrPackage] : []
  ];
  const [host, testing, linting, ciService] = contributors;

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
    description
  });

  return {
    badges: buildBadgesDetails(visibility, projectType, packageName, ciService, unitTested, vcs),
    documentation: scaffoldDocumentation({projectType, packageName, visibility, scope}),
    vcsIgnore: buildVcsIgnoreLists({host, linting, testing, projectType}),
    verificationCommand: 'npm test',
    projectDetails: {...projectHomepage && {homepage: projectHomepage}}
  };
}
