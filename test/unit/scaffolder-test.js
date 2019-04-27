import fs from 'mz/fs';
import {questionNames as commonQuestionNames} from '@travi/language-scaffolder-prompts';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as prompts from '../../src/prompts/questions';
import * as installer from '../../src/package/install';
import * as optionsValidator from '../../src/options-validator';
import * as ci from '../../src/ci';
import * as testing from '../../src/testing/scaffolder';
import * as host from '../../src/host';
import * as babel from '../../src/config/babel';
import * as linting from '../../src/linting/scaffolder';
import * as npmConfig from '../../src/config/npm';
import * as documentation from '../../src/documentation';
import * as nodeVersionScaffolder from '../../src/node-version/scaffolder';
import * as badgeDetailsBuilder from '../../src/badges';
import * as vcsIgnoresBuilder from '../../src/vcs-ignore';
import * as commitConvention from '../../src/commit-convention/scaffolder';
import * as packageScaffolder from '../../src/package/scaffolder';
import * as packageTypeScaffolder from '../../src/project-type/package/scaffolder';
import * as applicationTypeScaffolder from '../../src/project-type/application';
import * as packageNameBuilder from '../../src/package-name';
import {scaffold} from '../../src/scaffolder';
import {questionNames} from '../../src/prompts/question-names';

suite('javascript project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const ciServices = any.simpleObject();
  const hosts = any.simpleObject();
  const projectRoot = any.string();
  const projectName = any.string();
  const packageName = any.string();
  const homepage = any.url();
  const visibility = any.fromList(['Private', 'Public']);
  const version = any.string();
  const commitConventionDevDependencies = any.listOf(any.string);
  const hostResults = any.simpleObject();
  const babelResults = any.simpleObject();
  const chosenHost = any.word();
  const projectType = any.word();
  const scope = any.word();
  const license = any.string();
  const authorName = any.string();
  const authorEmail = any.string();
  const authorUrl = any.url();
  const integrationTested = any.boolean();
  const unitTested = any.boolean();
  const tests = {unit: unitTested, integration: integrationTested};
  const vcsDetails = any.simpleObject();
  const chosenCiService = any.word();
  const overrides = any.simpleObject();
  const description = any.sentence();
  const babelPresetName = any.string();
  const babelPreset = {name: babelPresetName};
  const configs = {babelPreset, ...any.simpleObject()};
  const versionCategory = any.word();
  const testingResults = any.simpleObject();
  const buildDirectory = any.string();
  const packageTypeResults = {...any.simpleObject(), buildDirectory};
  const applicationTypeResults = {...any.simpleObject(), buildDirectory};
  const lintingResults = any.simpleObject();
  const ciServiceResults = any.simpleObject();
  const commitConventionResults = any.simpleObject();
  const applicationTypes = any.simpleObject();
  const transpileLint = any.boolean();
  const contributors = [
    hostResults,
    testingResults,
    lintingResults,
    ciServiceResults,
    babelResults,
    commitConventionResults
  ];
  const packageScaffoldingInputs = {
    projectRoot,
    projectType,
    contributors,
    packageName,
    visibility,
    license,
    tests,
    vcs: vcsDetails,
    author: {name: authorName, email: authorEmail, url: authorUrl},
    description
  };
  const commonPromptAnswers = {
    [questionNames.NODE_VERSION_CATEGORY]: any.word(),
    [questionNames.PROJECT_TYPE]: projectType,
    [questionNames.UNIT_TESTS]: unitTested,
    [questionNames.INTEGRATION_TESTS]: integrationTested,
    [questionNames.SCOPE]: scope,
    [questionNames.PROJECT_TYPE]: projectType,
    [commonQuestionNames.UNIT_TESTS]: tests.unit,
    [commonQuestionNames.INTEGRATION_TESTS]: tests.integration,
    [questionNames.AUTHOR_NAME]: authorName,
    [questionNames.AUTHOR_EMAIL]: authorEmail,
    [questionNames.AUTHOR_URL]: authorUrl,
    [commonQuestionNames.CI_SERVICE]: chosenCiService,
    [questionNames.HOST]: chosenHost,
    [questionNames.NODE_VERSION_CATEGORY]: versionCategory,
    [questionNames.TRANSPILE_LINT]: transpileLint
  };

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(installer, 'default');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(ci, 'default');
    sandbox.stub(testing, 'default');
    sandbox.stub(host, 'default');
    sandbox.stub(babel, 'default');
    sandbox.stub(linting, 'default');
    sandbox.stub(npmConfig, 'default');
    sandbox.stub(documentation, 'default');
    sandbox.stub(nodeVersionScaffolder, 'default');
    sandbox.stub(badgeDetailsBuilder, 'default');
    sandbox.stub(vcsIgnoresBuilder, 'default');
    sandbox.stub(commitConvention, 'default');
    sandbox.stub(packageScaffolder, 'default');
    sandbox.stub(packageTypeScaffolder, 'default');
    sandbox.stub(applicationTypeScaffolder, 'default');
    sandbox.stub(packageNameBuilder, 'default');

    fs.writeFile.resolves();
    fs.copyFile.resolves();
    packageNameBuilder.default.withArgs(projectName, scope).returns(packageName);
    packageScaffolder.default
      .withArgs(packageScaffoldingInputs)
      .resolves({...any.simpleObject(), homepage});
    prompts.prompt.withArgs(overrides, ciServices, hosts, visibility, vcsDetails).resolves(commonPromptAnswers);
    ci.default
      .withArgs(
        ciServices,
        chosenCiService,
        {
          projectRoot,
          vcs: vcsDetails,
          visibility,
          packageType: projectType,
          nodeVersion: version,
          tests
        }
      )
      .resolves(ciServiceResults);
    testing.default.withArgs({projectRoot, tests, visibility}).resolves(testingResults);
    linting.default.withArgs({configs, projectRoot, tests, vcs: vcsDetails, transpileLint}).resolves(lintingResults);
    babel.default.withArgs({projectRoot, preset: babelPreset, transpileLint}).resolves(babelResults);
    npmConfig.default.resolves();
    commitConvention.default.withArgs({projectRoot, configs}).resolves(commitConventionResults);
    nodeVersionScaffolder.default.withArgs({projectRoot, nodeVersionCategory: versionCategory}).resolves(version);
    optionsValidator.validate
      .withArgs(options)
      .returns({
        visibility,
        projectRoot,
        configs,
        ciServices,
        overrides,
        hosts,
        projectName,
        license,
        vcs: vcsDetails,
        description,
        applicationTypes
      });
  });

  teardown(() => sandbox.restore());

  suite('config files', () => {
    test('that config files are created', async () => {
      host.default.withArgs(hosts, chosenHost, {}).resolves(hostResults);

      await scaffold(options);

      assert.calledWith(babel.default, {preset: babelPreset, projectRoot, transpileLint});
      assert.calledWith(npmConfig.default, {projectRoot, projectType});
    });

    suite('build', () => {
      suite('package', () => {
        test('that a package type project gets additional details scaffolded', async () => {
          const packageProjectType = 'Package';
          prompts.prompt
            .withArgs(overrides, ciServices, hosts, visibility, vcsDetails)
            .resolves({...commonPromptAnswers, [questionNames.PROJECT_TYPE]: packageProjectType});
          packageTypeScaffolder.default
            .withArgs({projectRoot, transpileLint, packageName, visibility})
            .resolves(packageTypeResults);
          packageScaffolder.default.resolves(any.simpleObject());
          host.default.withArgs(hosts, chosenHost, {buildDirectory}).resolves(hostResults);
          ci.default
            .withArgs(
              ciServices,
              chosenCiService,
              {
                projectRoot,
                vcs: vcsDetails,
                visibility,
                packageType: packageProjectType,
                nodeVersion: version,
                tests
              }
            )
            .resolves(ciServiceResults);

          await scaffold(options);

          assert.calledWith(
            packageScaffolder.default,
            {
              ...packageScaffoldingInputs,
              projectType: packageProjectType,
              contributors: [...contributors, packageTypeResults]
            }
          );
        });
      });

      suite('application', () => {
        test('that an application type project gets additional details scaffolded', async () => {
          const applicationProjectType = 'Application';
          prompts.prompt
            .withArgs(overrides, ciServices, hosts, visibility, vcsDetails)
            .resolves({...commonPromptAnswers, [questionNames.PROJECT_TYPE]: applicationProjectType});
          applicationTypeScaffolder.default
            .withArgs({projectRoot, applicationTypes, configs, transpileLint})
            .resolves(applicationTypeResults);
          packageScaffolder.default.resolves(any.simpleObject());
          host.default.withArgs(hosts, chosenHost, {buildDirectory}).resolves(hostResults);
          ci.default
            .withArgs(
              ciServices,
              chosenCiService,
              {
                projectRoot,
                vcs: vcsDetails,
                visibility,
                packageType: applicationProjectType,
                nodeVersion: version,
                tests
              }
            )
            .resolves(ciServiceResults);

          await scaffold(options);

          assert.calledWith(
            packageScaffolder.default,
            {
              ...packageScaffoldingInputs,
              projectType: applicationProjectType,
              contributors: [...contributors, applicationTypeResults]
            }
          );
        });
      });
    });
  });

  suite('data passed downstream', () => {
    setup(() => host.default.withArgs(hosts, chosenHost, {}).resolves(hostResults));

    suite('badges', () => {
      test('that badges are provided', async () => {
        const builtBadges = any.simpleObject();
        badgeDetailsBuilder.default
          .withArgs(visibility, projectType, packageName, ciServiceResults, unitTested, vcsDetails, contributors)
          .returns(builtBadges);

        const {badges} = await scaffold(options);

        assert.equal(badges, builtBadges);
      });
    });

    suite('vcs ignore', () => {
      test('that ignores are defined', async () => {
        const ignores = any.simpleObject();
        vcsIgnoresBuilder.default
          .withArgs({host: hostResults, linting: lintingResults, testing: testingResults, projectType})
          .returns(ignores);
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {vcsIgnore} = await scaffold(options);

        assert.equal(vcsIgnore, ignores);
      });
    });

    suite('verification', () => {
      test('that `npm test` is defined as the verification command', async () => {
        const {verificationCommand} = await scaffold(options);

        assert.equal(verificationCommand, 'npm test');
      });
    });

    suite('project details', () => {
      test('that details are passed along', async () => {
        const {projectDetails} = await scaffold(options);

        assert.equal(projectDetails.homepage, homepage);
      });

      test('that details are not passed along if not defined', async () => {
        packageScaffolder.default.withArgs(packageScaffoldingInputs).resolves(any.simpleObject());

        const {projectDetails} = await scaffold(options);

        assert.isUndefined(projectDetails.homepage);
      });
    });

    suite('documentation', () => {
      test('that appropriate documentation is passed along', async () => {
        const docs = any.simpleObject();
        documentation.default.withArgs({projectType, packageName, visibility, scope}).returns(docs);
        optionsValidator.validate
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices, scope});

        const {documentation: documentationContent} = await scaffold(options);

        assert.equal(documentationContent, docs);
      });
    });
  });
});
