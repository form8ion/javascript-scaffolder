import {info} from '@travi/cli-messages';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {validate} from './options-validator';
import {prompt} from './prompts/questions';
import scaffoldTesting from './testing';
import scaffoldChoice from './choice-scaffolder';
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
    applicationTypes,
    packageTypes,
    decisions
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
  } = await prompt(overrides, ciServices, hosts, visibility, vcs, decisions);

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
    packageTypes,
    scope,
    tests,
    vcs,
    decisions
  });
  const [testingResults, nodeVersion, npmResults] = await Promise.all([
    scaffoldTesting({projectRoot, tests, visibility, vcs}),
    scaffoldNodeVersion({projectRoot, nodeVersionCategory}),
    scaffoldNpmConfig({projectType, projectRoot})
  ]);
  const contributors = [
    ...(await Promise.all([
      scaffoldChoice(
        hosts,
        chosenHost,
        {buildDirectory: `./${projectTypeResults.buildDirectory}`, projectRoot, projectName, nodeVersion}
      ),
      scaffoldLinting({
        configs,
        projectRoot,
        tests,
        vcs,
        transpileLint,
        buildDirectory: projectTypeResults.buildDirectory,
        eslintConfigs: [...testingResults.eslintConfigs, ...projectTypeResults.eslintConfigs]
      }),
      scaffoldChoice(ciServices, ci, {projectRoot, vcs, visibility, projectType, nodeVersion, tests}),
      scaffoldBabel({preset: configs.babelPreset, projectRoot, transpileLint}),
      scaffoldCommitConvention({projectRoot, configs})
    ])),
    projectTypeResults,
    testingResults,
    npmResults
  ];

  const {homepage: projectHomepage} = await scaffoldPackage({
    projectRoot,
    projectType,
    contributors,
    packageName,
    license,
    vcs,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    description,
    packageProperties: projectTypeResults.packageProperties
  });

  return {
    badges: buildBadgesDetails(contributors),
    documentation: scaffoldDocumentation({projectTypeResults}),
    vcsIgnore: buildVcsIgnoreLists(contributors),
    verificationCommand: 'npm test',
    projectDetails: {...projectHomepage && {homepage: projectHomepage}},
    nextSteps: [...projectTypeResults.nextSteps]
  };
}
