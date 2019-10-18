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
import scaffoldNodeVersion from './node-version';
import {questionNames} from './prompts/question-names';
import buildBadgesDetails from './badges';
import buildVcsIgnoreLists from './vcs-ignore';
import scaffoldPackage from './package';
import buildPackageName from './package-name';
import scaffoldProjectType from './project-type';

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
  const tests = {unit: unitTested, integration: integrationTested};
  const projectTypeResults = await scaffoldProjectType({
    projectType,
    projectRoot,
    projectName,
    packageName,
    transpileLint,
    visibility,
    applicationTypes,
    scope,
    tests
  });
  const [testingResults, nodeVersion] = await Promise.all([
    scaffoldTesting({projectRoot, tests, visibility, vcs}),
    scaffoldNodeVersion({projectRoot, nodeVersionCategory}),
    scaffoldNpmConfig({projectType, projectRoot})
  ]);
  const contributors = [
    ...(await Promise.all([
      scaffoldHost(hosts, chosenHost, {buildDirectory: `./${projectTypeResults.buildDirectory}`, projectRoot}),
      scaffoldLinting({
        configs,
        projectRoot,
        tests,
        vcs,
        transpileLint,
        buildDirectory: projectTypeResults.buildDirectory,
        eslintConfigs: testingResults.eslintConfigs
      }),
      scaffoldCi(ciServices, ci, {projectRoot, vcs, visibility, packageType: projectType, nodeVersion, tests}),
      scaffoldBabel({preset: configs.babelPreset, projectRoot, transpileLint}),
      scaffoldCommitConvention({projectRoot, configs})
    ])),
    projectTypeResults,
    testingResults
  ];

  const {homepage: projectHomepage} = await scaffoldPackage({
    projectRoot,
    projectType,
    contributors,
    packageName,
    license,
    vcs,
    tests,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    description,
    packageProperties: projectTypeResults.packageProperties
  });

  return {
    badges: buildBadgesDetails(contributors),
    documentation: scaffoldDocumentation({projectTypeResults}),
    vcsIgnore: buildVcsIgnoreLists(contributors),
    verificationCommand: 'npm test && npm ls',
    projectDetails: {...projectHomepage && {homepage: projectHomepage}}
  };
}
