import {info} from '@travi/cli-messages';
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
import scaffoldPackageType from './project-type/package/scaffolder';
import scaffoldApplicationType from './project-type/application';
import buildPackageName from './package-name';

export async function scaffold(options) {
  info('Initializing JavaScript project');

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

  info('Writing project files', {level: 'secondary'});

  const packageName = buildPackageName(projectName, scope);
  const [applicationOrPackage] = await Promise.all([
    ...'Package' === projectType ? [scaffoldPackageType(({projectRoot, transpileLint, packageName, visibility}))] : [],
    ...'Application' === projectType
      ? [scaffoldApplicationType(({projectRoot, applicationTypes, configs, transpileLint}))]
      : []
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
      scaffoldTesting({projectRoot, tests, visibility, vcs}),
      scaffoldLinting(({configs, projectRoot, tests, vcs, transpileLint})),
      scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType: projectType, nodeVersion, tests}),
      scaffoldBabel({preset: configs.babelPreset, projectRoot, transpileLint}),
      scaffoldCommitConvention({projectRoot, configs})
    ])),
    ...applicationOrPackage ? [applicationOrPackage] : []
  ];
  const [host, testing, linting] = contributors;

  const {homepage: projectHomepage} = await scaffoldPackage({
    projectRoot,
    projectType,
    contributors,
    packageName,
    visibility,
    license,
    vcs,
    tests,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    description
  });

  return {
    badges: buildBadgesDetails(visibility, unitTested, vcs, contributors),
    documentation: scaffoldDocumentation({projectType, packageName, visibility, scope}),
    vcsIgnore: buildVcsIgnoreLists({host, linting, testing, projectType}),
    verificationCommand: 'npm test',
    projectDetails: {...projectHomepage && {homepage: projectHomepage}}
  };
}
